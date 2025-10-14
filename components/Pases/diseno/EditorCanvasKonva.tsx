// components/Pases/diseno/EditorCanvasKonva.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { z } from 'zod';
import { gridStepPx, mmToPx } from '@/lib/pat/disenos/editor/units';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';

const JsonInput = z.union([z.string(), z.record(z.string(), z.unknown())]);

function toJsonString(input: unknown): string {
  const parsed = JsonInput.safeParse(input);
  if (!parsed.success) return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}';
  if (typeof parsed.data === 'string') return parsed.data;
  try { return JSON.stringify(parsed.data); } catch { return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}'; }
}

function findOrCreateEditableLayer(stage: Konva.Stage): Konva.Layer {
  // Buscar la primera Layer que NO sea la de grilla
  const layers = stage.getLayers();
  const editable = layers.find((l) => !l.hasName('__gridLayer__'));
  if (editable) return editable;

  // Si no hay ninguna (caso extremo), crear una nueva
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

// Capa de grilla usando un Konva.Shape con sceneFunc (rápido y liviano)
function createOrUpdateGrid(stage: Konva.Stage, stepPx: number) {
  // eliminamos cualquier grid anterior
  stage.find('.__grid__').forEach((n) => n.destroy());

  if (stepPx < 2) return; // no dibujar grillas demasiado densas

  const grid = new Konva.Shape({
    name: '__grid__',
    listening: false,
    sceneFunc: (ctx, shape) => {
      const { width, height } = stage.size();
      ctx.beginPath();
      // líneas verticales
      for (let x = 0; x <= width; x += stepPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      // líneas horizontales
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

  // insertamos una capa al principio
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

  const jsonString = useMemo(() => toJsonString(json), [json]);

  const widthPx = Math.max(100, mmToPx(mmAncho, dpi));
  const heightPx = Math.max(100, mmToPx(mmAlto, dpi));
  const stepPx = Math.max(1, gridStepPx(gridStepMm, dpi));

  // teclado: Shift invierte el snap (si está ON lo apaga, si está OFF lo enciende)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
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

    // Destruir previo
    stageRef.current?.destroy();
    transformerRef.current = null;

    // Crear desde JSON
    const stage = Konva.Node.create(jsonString, containerRef.current) as Konva.Stage;
    stage.size({ width: widthPx, height: heightPx });

    // Grilla
    createOrUpdateGrid(stage, stepPx);

    // Hidratar imágenes
    hydrateImages(stage);

    // Transformer
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
      // si snapEnabled es true, Shift lo apaga; si es false, Shift lo enciende
      return snapEnabled ? !isShiftPressed : isShiftPressed;
    };

    // Cambios (drag/transform) + snap en *end* (evita jitter)
    stage.on('dragend transformend', (evt) => {
      if (!shouldSnap()) {
        onChange(stage.toJSON());
        return;
      }
      const node = evt.target as Konva.Node;
      const nAny = node as unknown as { x?: () => number; y?: () => number; width?: () => number; height?: () => number; setAttrs?: (a: Record<string, unknown>) => void; };
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
      if (node && typeof (node as { setAttrs?: (a: Record<string, unknown>) => void }).setAttrs === 'function') {
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

  // Helpers para toolbar (eventos globales)
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
      const text = new Konva.Text({ x: 60, y: 60, text: 'Nuevo texto ${registro.apellido}', fontSize: 18, draggable: true });
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

    window.addEventListener(EditorEvent.ADD_RECT, addRect as EventListener);
    window.addEventListener(EditorEvent.ADD_TEXT, addText as EventListener);
    window.addEventListener(EditorEvent.ADD_IMAGE, addImage as EventListener);

    return () => {
      window.removeEventListener(EditorEvent.ADD_RECT, addRect as EventListener);
      window.removeEventListener(EditorEvent.ADD_TEXT, addText as EventListener);
      window.removeEventListener(EditorEvent.ADD_IMAGE, addImage as EventListener);
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
