'use server';

import { insertarRecursoDiseno } from './diseno-recursos-queries';
import { Buffer } from 'node:buffer';

export async function subirRecursoDiseno(formData: FormData) {
  const disenoIdRaw = formData.get('diseno_id');
  const fileRaw = formData.get('file');

  const diseno_id = typeof disenoIdRaw === 'string' ? disenoIdRaw : '';
  if (!diseno_id) throw new Error('Falta diseno_id');

  if (!(fileRaw instanceof File)) throw new Error('Falta archivo');
  const arrayBuf = await fileRaw.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const mime = fileRaw.type || 'application/octet-stream';
  const nombre = fileRaw.name || 'recurso';

  const { id } = await insertarRecursoDiseno({
    diseno_id,
    nombre,
    mime_type: mime,
    datos: buffer,
  });

  const url = `/api/disenos/${encodeURIComponent(diseno_id)}/recursos/${encodeURIComponent(id)}`;
  return { id, url, nombre, mime };
}
