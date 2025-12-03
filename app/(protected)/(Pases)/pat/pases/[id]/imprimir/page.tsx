// app/(protected)/(Pases)/pat/pases/[id]/imprimir/page.tsx
import { notFound } from "next/navigation";
import { obtenerPatConRegistroPorId } from "@/lib/database/pat-queries";
import { obtenerDisenoPatPorId } from "@/lib/database/diseno-pat-queries";
import PrintPatClient from "@/components/Pases/Imprimir/PrintPatClient";

export default async function PaginaImprimirPAT({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ diseno?: string }>;
}) {
  const { id } = await params;
  const { diseno } = await searchParams;

  const usuarioActual = "usuariocivil";

  const idPatNum = Number(id);
  if (!idPatNum || !diseno) notFound();

  const pat = await obtenerPatConRegistroPorId(idPatNum);
  const dis = await obtenerDisenoPatPorId(String(diseno));

  if (!pat || !dis || dis.estado !== "publicado") {
    notFound();
  }

  // Campos mínimos para el cliente
  const payload = {
    pat,
    diseno: {
      id: dis.id,
      nombre: dis.nombre,
      ancho_mm: dis.ancho_mm,
      alto_mm: dis.alto_mm,
      dpi_previsualizacion: dis.dpi_previsualizacion,
      lienzo_json: dis.lienzo_json,
    },
    impreso_por: usuarioActual,
  };

  return (
    <div className="p-4">
      {/* CSS de impresión: tamaño exacto del diseño y sin márgenes */}
      <style
            dangerouslySetInnerHTML={{
                __html: `
            @page { size: ${dis.ancho_mm}mm ${dis.alto_mm}mm; margin: 0; }

            @media print {
            html, body { margin: 0; padding: 0; }
            body * { visibility: hidden !important; }          /* Oculta TODO */
            #print-root, #print-root * {                       /* Muestra SOLO el pase */
                visibility: visible !important;
            }
            #print-root {
                position: fixed;
                inset: 0;
                margin: 0;
            }
            }
                `.trim(),
            }}
        />
      <PrintPatClient payload={payload} />
    </div>
  );
}
