// components/Pases/diseno/EditorCanvasKonva.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { z } from 'zod';
import { gridStepPx, mmToPx } from '@/lib/pat/disenos/editor/units';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';
import type { VariableKey } from '@/lib/pat/disenos/editor/vars';
import { cleanupStage, serializeStagePruned } from '@/helpers/konva-serialize';

const TextStyleSchema = z.object({
  fill: z.string().optional(),
  fontStyle: z.enum(['normal', 'italic', 'bold', 'italic bold']).optional(),
  textDecoration: z.enum(['underline', 'line-through', 'underline line-through']).optional(),
}).partial();

const AddTextDetailSchema = z.object({
  text: z.string().optional(),
  style: TextStyleSchema.optional(),
});

const JsonInput = z.union([z.string(), z.record(z.string(), z.unknown())]);

function toJsonStringSafe(input: unknown, stage: Konva.Stage | null | undefined): string {
  const parsed = JsonInput.safeParse(input);
  if (parsed.success) {
    if (typeof parsed.data === 'string') return parsed.data;
    try { return JSON.stringify(parsed.data); } catch { /* continue to fallback */ }
  }
  const current = stage?.toJSON();
  if (typeof current === 'string' && current.length > 0) return current;
  return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}';
}

function findOrCreateEditableLayer(stage: Konva.Stage): Konva.Layer {
  const existing = stage.findOne('Layer.__editable__') as Konva.Layer | null;
  if (existing) return existing;
  const layer = new Konva.Layer({ name: '__editable__' });
  stage.add(layer);
  return layer;
}

function fitKeepRatio(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number,
  minW = 24,
  minH = 24
) {
  const r = srcW / srcH;
  let w = Math.min(srcW, maxW);
  let h = w / r;
  if (h > maxH) {
    h = Math.min(srcH, maxH);
    w = h * r;
  }
  w = Math.max(minW, Math.round(w));
  h = Math.max(minH, Math.round(h));
  return { w, h, r };
}

function hydrateImages(stage: Konva.Stage) {
  const images = stage.find('Image');
  images.forEach((n) => {
    const node = n as Konva.Image;
    const src = node.getAttr('imageSrc');
    if (typeof src === 'string' && src.length > 0) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        node.image(img);
        node.getLayer()?.batchDraw();
      };
      img.onerror = () => {
        node.getLayer()?.batchDraw();
      };
      img.src = src;
    }
  });
}

function createOrUpdateGrid(stage: Konva.Stage, stepPx: number) {
  stage.find('.__grid__').forEach((n) => n.destroy());
  stage.find('.__gridLayer__').forEach((n) => n.destroy());
  if (stepPx < 2) return;

  const grid = new Konva.Shape({
    name: '__grid__',
    listening: false,
    sceneFunc: (ctx, shape) => {
      const { width, height } = stage.size();
      ctx.beginPath();
      for (let x = 0; x <= width; x += stepPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += stepPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.stroke();
      ctx.closePath();
      ctx.fillStrokeShape(shape);
    },
  });

  const bgLayer = new Konva.Layer({ listening: false, name: '__gridLayer__' });
  bgLayer.add(grid);
  stage.add(bgLayer);
  bgLayer.moveToBottom();
  bgLayer.draw();
}

function roundToStep(v: number, step: number): number {
  return Math.round(v / step) * step;
}


export default function EditorCanvasKonva({
  json,
  mmAncho,
  mmAlto,
  dpi,
  gridStepMm,
  snapEnabled,
  onChange,
}: {
  json: unknown;
  mmAncho: number;
  mmAlto: number;
  dpi: number;
  gridStepMm: number;
  snapEnabled: boolean;
  onChange: (jsonString: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);

  const jsonString = useMemo(() => toJsonStringSafe(json, stageRef.current), [json]);
  const widthPx = Math.max(100, mmToPx(mmAncho, dpi));
  const heightPx = Math.max(100, mmToPx(mmAlto, dpi));
  const stepPx = Math.max(1, gridStepPx(gridStepMm, dpi));

  // teclado: Shift invierte el snap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      // borrar selección con Del/Backspace (si no estamos editando texto)
      if (e.key === 'Delete' || e.key === 'Backspace'){
        window.dispatchEvent(new CustomEvent(EditorEvent.DELETE_SELECTED));
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    stageRef.current?.destroy();
    transformerRef.current = null;

    const stage = Konva.Node.create(jsonString, containerRef.current) as Konva.Stage;
    stage.size({ width: widthPx, height: heightPx });
    cleanupStage(stage);
    createOrUpdateGrid(stage, stepPx);
    hydrateImages(stage);

    const layer = findOrCreateEditableLayer(stage);
    const tr = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: [
        'top-left','top-right','bottom-left','bottom-right',
        'middle-left','middle-right','top-center','bottom-center',
      ],
      ignoreStroke: true,
    });
    layer.add(tr);
    transformerRef.current = tr;

    // Selección
    stage.on('click tap', (e) => {
      if (e.target === stage) {
        tr.nodes([]);
        layer.draw();
        return;
      }
      const target = e.target;
      if (target.getClassName() === 'Transformer' || target.getClassName() === 'Layer') return;
      tr.nodes([target as Konva.Node]);
      layer.draw();
    });

    // Snap helpers
    const shouldSnap = () => {
      return snapEnabled ? !isShiftPressed : isShiftPressed;
    };

    // Cambios + snap en end
    stage.on('dragend transformend', (evt) => {
      if (!shouldSnap()) {
        onChange(serializeStagePruned(stage));
        return;
      }
      const node = evt.target as Konva.Node;
      const nAny = node as unknown as {
        x?: () => number; y?: () => number; width?: () => number; height?: () => number;
        setAttrs?: (a: Record<string, unknown>) => void;
      };
      const current = {
        x: typeof nAny.x === 'function' ? nAny.x() : undefined,
        y: typeof nAny.y === 'function' ? nAny.y() : undefined,
        width: typeof nAny.width === 'function' ? nAny.width() : undefined,
        height: typeof nAny.height === 'function' ? nAny.height() : undefined,
      };
      const next: Record<string, unknown> = {};
      if (typeof current.x === 'number') next.x = roundToStep(current.x, stepPx);
      if (typeof current.y === 'number') next.y = roundToStep(current.y, stepPx);
      if (typeof current.width === 'number' && current.width > 0) next.width = Math.max(stepPx, roundToStep(current.width, stepPx));
      if (typeof current.height === 'number' && current.height > 0) next.height = Math.max(stepPx, roundToStep(current.height, stepPx));
      if (typeof (node as { setAttrs?: (a: Record<string, unknown>) => void }).setAttrs === 'function') {
        (node as { setAttrs: (a: Record<string, unknown>) => void }).setAttrs(next);
      }
      node.getLayer()?.draw();
      onChange(serializeStagePruned(stage));
    });

    stageRef.current = stage;

    return () => {
      stage.destroy();
      stageRef.current = null;
      transformerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonString, widthPx, heightPx, stepPx, snapEnabled, isShiftPressed]);

  // Eventos globales (ADD_RECT / ADD_TEXT / ADD_IMAGE / ADD_VARIABLE / DELETE_SELECTED)
  useEffect(() => {
    function addRect() {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);
      const rect = new Konva.Rect({ x: 50, y: 50, width: 120, height: 80, stroke: '#222', strokeWidth: 1, draggable: true });
      layer.add(rect); layer.draw();
      (transformerRef.current)?.nodes([rect]);
      onChange(serializeStagePruned(stage));
    }

    function addText(ev?: Event) {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);

      // Defaults
      let initial = 'Nuevo texto';
      const attrs: Partial<Konva.TextConfig> = {};

      // Parseo seguro del payload (unknown) con Zod
      const detailUnknown = (ev as CustomEvent<unknown>)?.detail;
      const parsed = AddTextDetailSchema.safeParse(detailUnknown);
      if (parsed.success) {
        const { text, style } = parsed.data;
        if (typeof text === 'string' && text.trim().length > 0) {
          initial = text.trim();
        }
        if (style) {
          if (typeof style.fill === 'string') attrs.fill = style.fill;
          if (typeof style.fontStyle === 'string') attrs.fontStyle = style.fontStyle;
          if (typeof style.textDecoration === 'string') attrs.textDecoration = style.textDecoration;
        }
      }

      const textNode = new Konva.Text({
        x: 60,
        y: 60,
        text: initial,
        fontSize: 18,
        draggable: true,
        align: 'justify',
        wrap: 'none',
        ...attrs, // <-- aplica estilos mapeados 1:1
      });

      layer.add(textNode);
      layer.draw();
      (transformerRef.current)?.nodes([textNode]);
      onChange(serializeStagePruned(stage));
    }


    function addImage(ev: Event) {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);
      const detailUnknown = (ev as CustomEvent<unknown>).detail;

      let src: string | null = null;
      let recursoId: string | undefined;

      if (detailUnknown && typeof detailUnknown === 'object') {
        const rec = detailUnknown as Record<string, unknown>;
        if (typeof rec.imageSrc === 'string') src = rec.imageSrc;
        else if (typeof rec.src === 'string') src = rec.src;
        if (typeof rec.recursoId === 'string') recursoId = rec.recursoId;
      }
      if (!src) return;

      Konva.Image.fromURL(src, (node) => {
        // Dimensiones naturales + encaje a 60% del stage manteniendo ratio
        const imgEl = node.image() as HTMLImageElement | null;
        const natW = imgEl?.naturalWidth ?? 160;
        const natH = imgEl?.naturalHeight ?? 120;

        const { w, h, r } = fitKeepRatio(
          natW,
          natH,
          stage.width() * 0.6,
          stage.height() * 0.6
        );

        node.setAttrs({
          x: 80,
          y: 80,
          width: w,
          height: h,
          draggable: true,
          imageSrc: src,            // re-hidratación
          dataRecursoId: recursoId, // sync
          __aspect: r,              // guardar ratio para snap/resize
        });

        layer.add(node);
        layer.draw();

        // Selecciono y activo mantener ratio para imágenes
        if (transformerRef.current) {
          transformerRef.current.nodes([node]);
          transformerRef.current.setAttrs({ keepRatio: true });
        }

        onChange(serializeStagePruned(stage));
      });
    }


    function addVariable(ev: Event) {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);
      const detail = (ev as CustomEvent<unknown>).detail;
      if (!detail || typeof detail !== 'object') return;

      const rec = detail as Record<string, unknown>;
      const key = rec.key as VariableKey | undefined;
      if (!key) return;

      const labelByKey: Record<VariableKey, string> = {
        nro_interno: 'Nº interno',
        zona: 'Zona',
        acceso: 'Acceso',
        apellido_nombre: 'Apellido y Nombre',
        tipo_documento: 'Tipo documento',
        nro_documento: 'Nº documento',
        fecha_vencimiento: 'Fecha vencimiento',
        motivo: 'Motivo',
        codigo_seguridad: 'Código de seguridad',
      };

      const text = new Konva.Text({
        x: 90, y: 90, text: labelByKey[key], fontSize: 16, draggable: true,
        align: 'left', width: 220, wrap: 'word',
      });

      // Marcar como variable
      text.setAttrs({
        __kind: 'variable',
        varKey: key,
      });

      layer.add(text); layer.draw();
      (transformerRef.current)?.nodes([text]);
      onChange(serializeStagePruned(stage));
    }

    function deleteSelected() {
      const stage = stageRef.current; if (!stage) return;
      const tr = transformerRef.current; if (!tr) return;
      const nodes = tr.nodes();
      if (nodes.length === 0) return;

      // No eliminar grilla ni capas, solo shapes
      const deletable = nodes.filter((n) => {
        if (n.getClassName() === 'Layer' || n.hasName('__gridLayer__')) return false;
        return true;
      });

      deletable.forEach((n) => n.destroy());
      tr.nodes([]);
      stage.draw();
      onChange(serializeStagePruned(stage));
    }

    window.addEventListener(EditorEvent.ADD_RECT, addRect as EventListener);
    window.addEventListener(EditorEvent.ADD_TEXT, addText as EventListener);
    window.addEventListener(EditorEvent.ADD_IMAGE, addImage as EventListener);
    window.addEventListener(EditorEvent.ADD_VARIABLE, addVariable as EventListener);
    window.addEventListener(EditorEvent.DELETE_SELECTED, deleteSelected as EventListener);

    return () => {
      window.removeEventListener(EditorEvent.ADD_RECT, addRect as EventListener);
      window.removeEventListener(EditorEvent.ADD_TEXT, addText as EventListener);
      window.removeEventListener(EditorEvent.ADD_IMAGE, addImage as EventListener);
      window.removeEventListener(EditorEvent.ADD_VARIABLE, addVariable as EventListener);
      window.removeEventListener(EditorEvent.DELETE_SELECTED, deleteSelected as EventListener);
    };
  }, [onChange]);

  // Redibujar grilla si cambian dimensiones
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.size({ width: widthPx, height: heightPx });
    createOrUpdateGrid(stage, stepPx);
    stage.draw();
  }, [widthPx, heightPx, stepPx]);

  return (
    <div
      style={{ width: widthPx, height: heightPx }}
      className="border rounded-xl overflow-hidden bg-white"
      ref={containerRef}
    />
  );
}
