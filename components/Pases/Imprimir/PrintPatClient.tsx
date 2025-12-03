"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import ImageNext from "next/image";
import { construirVarsDesdePat, type RenderVars } from "@/lib/pat/impresion/vars";
import { logPrintAttempt } from "@/lib/database/log-impresion-actions";

type Payload = {
  pat: {
    id: number;
    documento_registro: string;
    nro_interno: string;
    fecha_vencimiento: string;
    tipo_zona: "ZC" | "ZR" | "HN" | "PS" | "OT";
    acceso_pat: string;
    causa_motivo_pat: string;
    codigo_de_seguridad: string;
    registro_apellido: string;
    registro_nombre: string;
    registro_documento: string;
    registro_tipo_documento: string;
  };
  diseno: {
    id: string;
    nombre: string;
    ancho_mm: number;
    alto_mm: number;
    dpi_previsualizacion: number;
    lienzo_json: unknown; // Konva Stage JSON
  };
};

export default function PrintPatClient({ payload }: { payload: Payload }) {
  const { pat, diseno } = payload;
  const vars: RenderVars = useMemo(() => construirVarsDesdePat(pat), [pat]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  // Flag para evitar doble log en React Strict Mode
  const logEnviado = useRef(false);

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  // Unificar instancia de Konva en toda la app
  const K: typeof Konva = (typeof window !== "undefined" && (window as unknown as { Konva?: typeof Konva }).Konva)
    ? (window as unknown as { Konva: typeof Konva }).Konva!
    : Konva;
  if (typeof window !== "undefined") {
    (window as unknown as { Konva?: typeof Konva }).Konva = K;
  }

  let destroyed = false;

  // Crear Stage desde el JSON
  const jsonObj: unknown = diseno.lienzo_json;
  const stage = (K as unknown as { Node: typeof Konva.Node })
    .Node.create(jsonObj as Record<string, unknown>, container) as Konva.Stage;

  // Inyectar variables
  stage.find("Text").forEach((node) => {
    if (node.getAttr("__kind") !== "variable") return;
    const key = typeof node.getAttr("varKey") === "string" ? (node.getAttr("varKey") as string) : "";
    node.setAttr("text", (vars as Record<string, string>)[key] ?? "");
  });

  // Precargar imágenes
  const imageNodes = stage.find("Image");
  const urls = Array.from(
    new Set(
      imageNodes
        .map(n => (typeof n.getAttr("imageSrc") === "string" ? (n.getAttr("imageSrc") as string) : null))
        .filter(Boolean) as string[]
    )
  );

  function loadOne(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }

  (async () => {
    try {
      if (urls.length) {
        const loaded = await Promise.all(urls.map(loadOne));
        const map = new Map(urls.map((u, i) => [u, loaded[i]] as const));
        imageNodes.forEach((node) => {
          const src = typeof node.getAttr("imageSrc") === "string" ? (node.getAttr("imageSrc") as string) : null;
          if (src && map.has(src)) node.setAttr("image", map.get(src) as HTMLImageElement);
        });
      }

      if (destroyed) return;
      stage.draw();

      const dpiImpresion = 300;
      const pixelRatio = Math.max(1, dpiImpresion / (diseno.dpi_previsualizacion || 300));

      const url = stage.toDataURL({ pixelRatio });
      if (!destroyed) setDataUrl(url);
    } catch {
      if (!destroyed) setDataUrl(stage.toDataURL({ pixelRatio: 1 }));
    }
  })();

  return () => {
    destroyed = true;
    try {
      stage.destroy();
      if (container) container.innerHTML = "";
    } catch {}
  };
}, [diseno, vars]);


  // Lanza impresión automática cuando la imagen esté lista
  useEffect(() => {
    if (!dataUrl) return;
    if (logEnviado.current) return;

    const procesarImpresion = async () => {
      logEnviado.current = true;

      // Llamamos a la Server Action (ahora sin pasar usuario)
      const resultado = await logPrintAttempt({
        pat_id: pat.id,
        diseno_id: diseno.id,
        variables_resueltas: vars as Record<string, string>,
      });

      if (!resultado.ok) {
        console.error("Fallo auditoría de impresión:", resultado.error);
        // Opcional: alert("Error al registrar auditoría");
        // Decidimos seguir e imprimir igual, o bloquear. Normalmente se imprime igual.
      }

      setTimeout(() => {
        window.print();
      }, 100);
    };

    procesarImpresion();
  }, [dataUrl, pat.id, diseno.id, vars]);

  return (
  <div id="print-root" className="w-full">
    <div ref={containerRef} className="hidden" style={{ width: 0, height: 0 }} />
    {dataUrl ? (
      <ImageNext
        src={dataUrl}
        alt={`PAT ${pat.id}`}
        width={1}
        height={1}
        style={{ width: `${diseno.ancho_mm}mm`, height: `${diseno.alto_mm}mm`, display: "block" }}
        priority
      />
    ) : (
      <div className="text-sm text-muted-foreground">Generando imagen para imprimir…</div>
    )}
  </div>
);
}
