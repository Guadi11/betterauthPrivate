// components/Pases/diseno/KonvaJsonViewer.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import Konva from 'konva';
import { z } from 'zod';

const LienzoJsonInput = z.union([z.string(), z.record(z.string(), z.unknown())]);

/** Convierte unknown (string u objeto) a JSON string válida para Konva.Node.create */
function normalizeLienzoJson(input: unknown): string {
  const parsed = LienzoJsonInput.safeParse(input);
  if (!parsed.success) return '{"className":"Stage","attrs":{"width":400,"height":300}}';
  if (typeof parsed.data === 'string') return parsed.data;
  try { return JSON.stringify(parsed.data); } catch { return '{"className":"Stage","attrs":{"width":400,"height":300}}'; }
}

export default function KonvaJsonViewer({
  lienzo,
  mmAncho,
  mmAlto,
  dpi,
  className,
}: {
  lienzo: unknown;       // puede venir string u objeto
  mmAncho: number;
  mmAlto: number;
  dpi: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const jsonString = useMemo(() => normalizeLienzoJson(lienzo), [lienzo]);

  // Escalado: 1 inch = 25.4 mm. Si querés respetar tamaño físico, escalamos por DPI.
  const pixelWidth = Math.max(100, Math.round((mmAncho / 25.4) * dpi));
  const pixelHeight = Math.max(100, Math.round((mmAlto / 25.4) * dpi));

  useEffect(() => {
    if (!containerRef.current) return;

    // limpiar stage previo si lo hubiera
    if (stageRef.current) {
      stageRef.current.destroy();
      stageRef.current = null;
    }

    // Creamos el Stage desde el JSON tal como sugiere Konva
    // https://konvajs.org/docs/data_and_serialization/Simple_Load.html
    // https://konvajs.org/docs/data_and_serialization/Complex_Load.html
    const stage = Konva.Node.create(jsonString, containerRef.current) as Konva.Stage;

    // Si el JSON trae attrs.width/height, los respetamos. Si no, aplicamos tamaño por mm/DPI:
    const attrs = stage?.attrs ?? {};
    const w = typeof attrs.width === 'number' ? attrs.width : pixelWidth;
    const h = typeof attrs.height === 'number' ? attrs.height : pixelHeight;
    stage.size({ width: w, height: h });

    stageRef.current = stage;

    // cleanup al desmontar o cambiar JSON
    return () => {
      stage.destroy();
      stageRef.current = null;
    };
  }, [jsonString, pixelWidth, pixelHeight]);

  // El contenedor es donde Konva inyecta su <canvas>
  return (
    <div
      className={className}
      style={{ width: pixelWidth, height: pixelHeight, overflow: 'auto' }}
    >
      <div
        ref={containerRef}
        style={{ display: 'inline-block', lineHeight: 0 /* quita gap visual */ }}
      />
    </div>
  );
}
