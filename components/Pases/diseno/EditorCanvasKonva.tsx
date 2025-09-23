'use client';

import { useEffect, useMemo, useRef } from 'react';
import Konva from 'konva';
import { z } from 'zod';

const JsonInput = z.union([z.string(), z.record(z.string(), z.unknown())]);

function toJsonString(input: unknown): string {
  const parsed = JsonInput.safeParse(input);
  if (!parsed.success) return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}';
  if (typeof parsed.data === 'string') return parsed.data;
  try { return JSON.stringify(parsed.data); } catch { return '{"className":"Stage","attrs":{"width":400,"height":300},"children":[{"className":"Layer","attrs":{}}]}'; }
}

function findOrCreateLayer(stage: Konva.Stage): Konva.Layer {
  const first = stage.findOne<Konva.Layer>('Layer');
  if (first) return first;
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
        // si falla, al menos dibujamos el rectángulo del contenedor
        node.getLayer()?.batchDraw();
      };
      img.src = src;
    }
  });
}

export default function EditorCanvasKonva({
  json,
  mmAncho,
  mmAlto,
  dpi,
  onChange,
}: {
  json: unknown;
  mmAncho: number;
  mmAlto: number;
  dpi: number;
  onChange: (jsonString: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const jsonString = useMemo(() => toJsonString(json), [json]);

  const widthPx = Math.max(100, Math.round((mmAncho / 25.4) * dpi));
  const heightPx = Math.max(100, Math.round((mmAlto / 25.4) * dpi));

  useEffect(() => {
    if (!containerRef.current) return;

    // Destruir previo
    stageRef.current?.destroy();
    transformerRef.current = null;

    // Crear desde JSON
    const stage = Konva.Node.create(jsonString, containerRef.current) as Konva.Stage;
    stage.size({ width: widthPx, height: heightPx });

    // Hidratar imágenes
    hydrateImages(stage);

    // Transformer
    const layer = findOrCreateLayer(stage);
    const tr = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left','top-right','bottom-left','bottom-right','middle-left','middle-right','top-center','bottom-center'],
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
      // Evitamos seleccionar el layer/transformer
      const target = e.target;
      if (target.getClassName() === 'Transformer' || target.getClassName() === 'Layer') return;
      tr.nodes([target as Konva.Node]);
      layer.draw();
    });

    // Cambios (drag/transform)
    stage.on('dragend transformend', () => {
      onChange(stage.toJSON());
    });

    stageRef.current = stage;

    return () => {
      stage.destroy();
      stageRef.current = null;
      transformerRef.current = null;
    };
  }, [jsonString, widthPx, heightPx, onChange]);

  // Helpers para toolbar (expuestos vía window eventos simples)
  // Podés llamar estos CustomEvents desde el componente padre.
  useEffect(() => {
    function addRect() {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateLayer(stage);
      const rect = new Konva.Rect({ x: 50, y: 50, width: 120, height: 80, fill: '#ddd', stroke: '#222', strokeWidth: 1, draggable: true });
      layer.add(rect); layer.draw();
      (transformerRef.current)?.nodes([rect]);
      onChange(stage.toJSON());
    }
    function addText() {
      const stage = stageRef.current; if (!stage) return;
      const layer = findOrCreateLayer(stage);
      const text = new Konva.Text({ x: 60, y: 60, text: 'Nuevo texto ${registro.apellido}', fontSize: 18, draggable: true });
      layer.add(text); layer.draw();
      (transformerRef.current)?.nodes([text]);
      onChange(stage.toJSON());
    }
    function addImage(ev: Event) {
    const stage = stageRef.current; if (!stage) return;
    const layer = findOrCreateLayer(stage);
    const detail = (ev as CustomEvent<{ src: string }>).detail;
    const src = detail?.src;
    if (!src) return;

    // ✅ fromURL resuelve el tipado y carga la imagen real
    Konva.Image.fromURL(src, (node) => {
        node.setAttrs({
        x: 80, y: 80, width: 160, height: 120,
        draggable: true,
        // guardamos la URL para re-hidratar luego desde JSON
        imageSrc: src,
        });
        layer.add(node);
        layer.draw();
        (transformerRef.current)?.nodes([node]);
        onChange(stage.toJSON());
    });
    }

    window.addEventListener('editor:addRect', addRect as EventListener);
    window.addEventListener('editor:addText', addText as EventListener);
    window.addEventListener('editor:addImage', addImage as EventListener);

    return () => {
      window.removeEventListener('editor:addRect', addRect as EventListener);
      window.removeEventListener('editor:addText', addText as EventListener);
      window.removeEventListener('editor:addImage', addImage as EventListener);
    };
  }, [onChange]);

  return (
    <div
      style={{ width: widthPx, height: heightPx }}
      className="border rounded-xl overflow-hidden bg-white"
      ref={containerRef}
    />
  );
}
