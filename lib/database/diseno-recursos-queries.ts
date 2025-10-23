import { query } from '@/lib/database/db';

export interface RecursoDisenoMeta {
  id: string;
  diseno_id: string;
  nombre: string;
  mime_type: string;
  creado_en: string; // ISO
}

export interface RecursoBytes {
  mime_type: string;
  datos: Buffer | Uint8Array;
}

export async function insertarRecursoDiseno(input: {
  diseno_id: string;
  nombre: string;
  mime_type: string;
  datos: Buffer;
}): Promise<{ id: string }> {
  const sql = `
    INSERT INTO recurso_diseno_pat (diseno_id, nombre, mime_type, datos)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const { rows } = await query(sql, [
    input.diseno_id,
    input.nombre,
    input.mime_type,
    input.datos,
  ]);
  return { id: rows[0].id };
}

export async function listarRecursosDeDiseno(diseno_id: string): Promise<RecursoDisenoMeta[]> {
  const sql = `
    SELECT id::text, diseno_id::text, nombre, mime_type,
           to_char(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS creado_en
    FROM recurso_diseno_pat
    WHERE diseno_id = $1
    ORDER BY creado_en DESC
  `;
  const { rows } = await query(sql, [diseno_id]);
  return rows;
}

export async function obtenerRecursoBytes(
  input: { id: string; diseno_id: string }
): Promise<RecursoBytes | null> {
  const sql = `
    SELECT mime_type, datos
    FROM recurso_diseno_pat
    WHERE id = $1::bigint AND diseno_id = $2::bigint
    LIMIT 1
  `;
  const { rows } = await query(sql, [input.id, input.diseno_id]);
  return rows[0] ?? null;
}