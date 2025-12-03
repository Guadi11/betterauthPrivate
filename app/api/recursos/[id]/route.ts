import { NextResponse } from "next/server";
import { obtenerRecursoBytes, obtenerThumbBytes } from "@/lib/database/recurso-queries";

export const runtime = "nodejs"; // Correcto para uso de Buffer/Crypto nativo

// Definimos el tipo de los props de la ruta para TypeScript estricto
type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request, 
  { params }: RouteProps
) {
  // 1. AWAIT: Desempaquetamos el ID esperando la promesa
  const { id } = await params;

  // 2. Lógica de URL (request.url ya es accesible)
  const url = new URL(request.url);
  const isThumb = url.searchParams.get("thumb") === "1";

  // 3. Consulta a Base de Datos (Pg)
  // Nota: Aquí asumimos que obtenerRecursoBytes maneja internamente la conexión con 'pg'
  const row = isThumb ? await obtenerThumbBytes(id) : await obtenerRecursoBytes(id);

  if (!row) {
    return new NextResponse("Not found", { status: 404 });
  }

  // 4. Construcción de Headers
  const headers = new Headers();
  headers.set("Content-Type", row.mime_type);
  // Cache agresivo (1 año), ideal para recursos inmutables con hash/id
  headers.set("Cache-Control", "public, max-age=31536000, immutable"); 
  headers.set("ETag", `W/"${row.sha256}"`);
  headers.set("Content-Length", String(row.datos.byteLength));

  // 5. Retorno del binario
  return new NextResponse(row.datos as unknown as BodyInit, { status: 200, headers });
}