"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import ImageNext from "next/image";
import { construirVarsDesdePat, type RenderVars } from "@/lib/pat/impresion/vars";

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

  // Crea el stage, aplica variables, precarga imágenes y exporta
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Crear Stage desde el JSON
    const jsonObj: unknown = diseno.lienzo_json;
    const stage = Konva.Node.create(
      jsonObj as Record<string, unknown>,
      container
    ) as Konva.Stage;

    // Asegurar tamaño (por si acaso)
    const w = stage.width();
    const h = stage.height();

    // 1) Inyectar variables en Text nodes
    const textNodes = stage.find("Text");
    textNodes.forEach((node) => {
      const kind: unknown = node.getAttr("__kind");
      if (kind !== "variable") return;
      const varKeyUnknown: unknown = node.getAttr("varKey");
      const varKey = typeof varKeyUnknown === "string" ? varKeyUnknown : "";
      const value = (vars as Record<string, string>)[varKey] ?? "";
      node.setAttr("text", value);
    });

    // 2) Precargar imágenes
    const imageNodes = stage.find("Image");
    const urls = imageNodes
      .map((n) => {
        const srcUnknown: unknown = n.getAttr("imageSrc");
        return typeof srcUnknown === "string" ? srcUnknown : null;
      })
      .filter(Boolean) as string[];

    const uniqueUrls = Array.from(new Set(urls));

    function loadOne(url: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous"; // mismo origen, por las dudas
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    }

    (async () => {
      try {
        const loaded = await Promise.all(uniqueUrls.map(loadOne));
        const map = new Map<string, HTMLImageElement>();
        uniqueUrls.forEach((u, i) => map.set(u, loaded[i]));

        imageNodes.forEach((node) => {
          const srcUnknown: unknown = node.getAttr("imageSrc");
          const src = typeof srcUnknown === "string" ? srcUnknown : null;
          if (src && map.has(src)) {
            node.setAttr("image", map.get(src) as HTMLImageElement);
          }
        });

        stage.draw();

        // 3) Exportar a PNG con buena resolución
        const dpiImpresion = 300;
        const pixelRatio = Math.max(1, dpiImpresion / (diseno.dpi_previsualizacion || 300));

        const url = stage.toDataURL({ pixelRatio });
        setDataUrl(url);
      } catch {
        // Si falla la carga de alguna imagen, exportamos igual
        const url = stage.toDataURL({ pixelRatio: 1 });
        setDataUrl(url);
      }
    })();

    return () => {
      // limpiar
      try {
        stage.destroy();
        if (container) container.innerHTML = "";
      } catch {}
    };
  }, [diseno, vars]);

  // Lanza impresión automática cuando la imagen esté lista
  useEffect(() => {
    if (!dataUrl) return;
    const t = setTimeout(() => {
      window.print();
    }, 100); // pequeño delay para pintar
    return () => clearTimeout(t);
  }, [dataUrl]);

  return (
    <div className="w-full">
      {/* contenedor oculto para Konva */}
      <div ref={containerRef} className="hidden" style={{ width: 0, height: 0 }} />

      {/* Resultado como imagen a tamaño físico */}
      {dataUrl ? (
        // Next/Image para layout, pero respetamos mm con style
        <ImageNext
          src={dataUrl}
          alt={`PAT ${pat.id}`}
          width={1} height={1} // ignorado por style
          style={{
            width: `${diseno.ancho_mm}mm`,
            height: `${diseno.alto_mm}mm`,
            display: "block",
          }}
          priority
        />
      ) : (
        <div className="text-sm text-muted-foreground">Generando imagen para imprimir…</div>
      )}
    </div>
  );
}
