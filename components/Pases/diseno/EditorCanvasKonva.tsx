// components/Pases/diseno/EditorCanvasKonva.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { z } from 'zod';
import { gridStepPx, mmToPx } from '@/lib/pat/disenos/editor/units';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';
import type { VariableKey } from '@/lib/pat/disenos/editor/vars';

const JsonInput = z.union([z.string(), z.record(z.string(), z.unknown())]);

function toJsonString(input: unknown): string {
  const parsed = JsonInput.safeParse(input);
  if (!parsed.success) return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}';
  if (typeof parsed.data === 'string') return parsed.data;
  try { return JSON.stringify(parsed.data); } catch { return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}'; }
}

function findOrCreateEditableLayer(stage: Konva.Stage): Konva.Layer {
  const layers = stage.getLayers();
  const editable = layers.find((l) => !l.hasName('__gridLayer__'));
  if (editable) return editable;
  const layer = new Konva.Layer();
  stage.add(layer);
  return layer;
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

// --- Helpers de edición de texto (textarea overlay)
function createTextareaForTextNode(
  container: HTMLDivElement,
  stage: Konva.Stage,
  textNode: Konva.Text,
  onCommit: (value: string) => void,
  onCancel: () => void,
): HTMLTextAreaElement {
  const ta = document.createElement('textarea');
  ta.value = textNode.text();
  ta.style.position = 'absolute';
  ta.style.zIndex = '10';
  ta.style.resize = 'none';
  ta.style.border = '1px solid #999';
  ta.style.outline = 'none';
  ta.style.padding = '4px 6px';
  ta.style.background = 'white';
  ta.style.fontFamily = textNode.fontFamily() || 'inherit';
  ta.style.fontSize = `${textNode.fontSize()}px`;
  ta.style.lineHeight = `${textNode.lineHeight()}`;
  ta.style.letterSpacing = `${textNode.letterSpacing()}px`;
  ta.style.transformOrigin = 'left top';

  // posición absoluta acorde a transformaciones del Stage
  const textPosition = textNode.absolutePosition();
  const stageBox = stage.container().getBoundingClientRect();
  const areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y,
  };
  ta.style.left = `${areaPosition.x}px`;
  ta.style.top = `${areaPosition.y}px`;
  ta.style.width = `${textNode.width()}px`;
  ta.style.height = `${textNode.height() || textNode.fontSize() * 1.4}px`;

  document.body.appendChild(ta);
  ta.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      // permitir saltos de línea con Enter normal
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      ta.remove();
    }
  };

  const handleBlur = () => {
    onCommit(ta.value);
    ta.remove();
  };

  ta.addEventListener('keydown', handleKeyDown);
  ta.addEventListener('blur', handleBlur);

  return ta;
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
  const [isEditingText, setIsEditingText] = useState<boolean>(false);

  const jsonString = useMemo(() => toJsonString(json), [json]);
  const widthPx = Math.max(100, mmToPx(mmAncho, dpi));
  const heightPx = Math.max(100, mmToPx(mmAlto, dpi));
  const stepPx = Math.max(1, gridStepPx(gridStepMm, dpi));

  // teclado: Shift invierte el snap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      // borrar selección con Del/Backspace (si no estamos editando texto)
      if (!isEditingText && (e.key === 'Delete' || e.key === 'Backspace')) {
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
  }, [isEditingText]);

  useEffect(() => {
    if (!containerRef.current) return;

    stageRef.current?.destroy();
    transformerRef.current = null;

    const stage = Konva.Node.create(jsonString, containerRef.current) as Konva.Stage;
    stage.size({ width: widthPx, height: heightPx });

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

    // Doble clic para editar texto (solo nodos Text que NO sean variables)
    stage.on('dblclick dbltap', (e) => {
      const node = e.target as Konva.Node;
      if (node.getClassName() !== 'Text') return;

      const txt = node as Konva.Text;
      const isVariable = Boolean(txt.getAttr('__kind') === 'variable');
      if (isVariable) return; // las variables no se editan inline

      if (!containerRef.current) return;
      setIsEditingText(true);

      const ta = createTextareaForTextNode(
        containerRef.current,
        stage,
        txt,
        (value) => {
          txt.text(value);
          txt.getLayer()?.batchDraw();
          onChange(stage.toJSON());
          setIsEditingText(false);
        },
        () => {
          setIsEditingText(false);
        },
      );

      // impedir que el DEL borre el nodo mientras escribís
      ta.addEventListener('keydown', (ke: KeyboardEvent) => {
        if (ke.key === 'Delete' || ke.key === 'Backspace') {
          ke.stopPropagation();
        }
      });
    });

    // Snap helpers
    const shouldSnap = () => {
      return snapEnabled ? !isShiftPressed : isShiftPressed;
    };

    // Cambios + snap en end
    stage.on('dragend transformend', (evt) => {
      if (!shouldSnap()) {
        onChange(stage.toJSON());
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
      onChange(stage.toJSON());
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
      const rect = new Konva.Rect({ x: 50, y: 50, width: 120, height: 80, fill: '#ddd', stroke: '#222', strokeWidth: 1, draggable: true });
      layer.add(rect); layer.draw();
      (transformerRef.current)?.nodes([rect]);
      onChange(stage.toJSON());
    }

    function addText() {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);
      const text = new Konva.Text({
        x: 60, y: 60, text: 'Nuevo texto', fontSize: 18, draggable: true,
        align: 'left', width: 200, wrap: 'word',
      });
      layer.add(text); layer.draw();
      (transformerRef.current)?.nodes([text]);
      onChange(stage.toJSON());
    }

    function addImage(ev: Event) {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateEditableLayer(stage);
      const detailUnknown = (ev as CustomEvent<unknown>).detail;
      let src: string | null = null;
      if (detailUnknown && typeof detailUnknown === 'object') {
        const rec = detailUnknown as Record<string, unknown>;
        if (typeof rec.src === 'string') src = rec.src;
      }
      if (!src) return;

      Konva.Image.fromURL(src, (node) => {
        node.setAttrs({
          x: 80, y: 80, width: 160, height: 120,
          draggable: true,
          imageSrc: src,
        });
        layer.add(node);
        layer.draw();
        (transformerRef.current)?.nodes([node]);
        onChange(stage.toJSON());
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
      onChange(stage.toJSON());
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
      onChange(stage.toJSON());
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
