import { obtenerRecursoBytes } from '@/lib/database/diseno-recursos-queries';

// Forzamos runtime Node (usamos Buffer/Uint8Array sin drama)
export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: { disenoId: string; recursoId: string } }
) {
  const { disenoId, recursoId } = params;

  // Buscar por id + diseno_id (evita falsos 404)
  const recurso = await obtenerRecursoBytes({ id: recursoId, diseno_id: disenoId });
  if (!recurso) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalizamos a ArrayBuffer (lo que espera el tipo de Response)
  let ab: ArrayBuffer;
  const datos = recurso.datos as unknown;

  if (datos instanceof Uint8Array) {
    // Respetar offset/length
    ab = datos.buffer.slice(datos.byteOffset, datos.byteOffset + datos.byteLength);
  } else if (typeof Buffer !== 'undefined' && datos instanceof Buffer) {
    ab = datos.buffer.slice(datos.byteOffset, datos.byteOffset + datos.byteLength);
  } else {
    // Fallback súper conservador (no debería entrar)
    const u8 = new Uint8Array(datos as ArrayBufferLike);
    ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  }

  return new Response(ab, {
    headers: {
      'Content-Type': recurso.mime_type,
      'Cache-Control': 'no-store',
      'Content-Length': String(ab.byteLength),
    },
  });
}
