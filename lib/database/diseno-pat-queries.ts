// lib/database/diseno-pat-queries.ts
import { query } from '@/lib/database/db';
import type {
  DisenoPatInsertInput,
  DisenoPatUpdateInput,
  DisenoPatListItem,
  DisenoPatRow,
  EstadoDiseno,
} from '@/lib/pat/disenos/diseno-pat-types';

/* ------------ Insert ------------ */
export async function insertarDisenoPat(
  data: DisenoPatInsertInput
): Promise<{ id: string }> {
  const sql = `
    INSERT INTO diseno_pat
      (nombre, ancho_mm, alto_mm, dpi_previsualizacion, lienzo_json, estado, creado_por)
    VALUES
      ($1,     $2,       $3,      $4,                  $5::jsonb,   $6,     $7)
    RETURNING id::text AS id
  `;

  const params: unknown[] = [
    data.nombre,
    data.ancho_mm,
    data.alto_mm,
    data.dpi_previsualizacion,
    data.lienzo_json, // objeto -> ::jsonb
    data.estado,
    data.creado_por,
  ];

  const res = await query(sql, params);
  const rowUnknown: unknown = (res as unknown as { rows: unknown[] }).rows?.[0];
  const id =
    rowUnknown && typeof rowUnknown === 'object'
      ? String((rowUnknown as Record<string, unknown>).id)
      : '';

  if (!id) throw new Error('No se pudo recuperar el id del diseño insertado.');
  return { id };
}

/* ------------ Listar ------------ */
export async function listarDisenos(
  estado?: EstadoDiseno
): Promise<DisenoPatListItem[]> {
  if (estado) {
    const sql = `
      SELECT id::text AS id, nombre, ancho_mm, alto_mm, dpi_previsualizacion, estado, actualizado_en
      FROM diseno_pat
      WHERE estado = $1
      ORDER BY actualizado_en DESC
    `;
    const { rows } = await query(sql, [estado]);
    return rows as unknown as DisenoPatListItem[];
  }

  const sql = `
    SELECT id::text AS id, nombre, ancho_mm, alto_mm, dpi_previsualizacion, estado, actualizado_en
    FROM diseno_pat
    ORDER BY actualizado_en DESC
  `;
  const { rows } = await query(sql);
  return rows as unknown as DisenoPatListItem[];
}

/* ------------ Get by id ------------ */
export async function obtenerDisenoPatPorId(
  id: string
): Promise<DisenoPatRow | null> {
  const sql = `
    SELECT
      id::text AS id,
      nombre,
      ancho_mm,
      alto_mm,
      dpi_previsualizacion,
      lienzo_json,
      estado,
      creado_por,
      creado_en,
      actualizado_en
    FROM diseno_pat
    WHERE id = $1::bigint
    LIMIT 1
  `;
  const { rows } = await query(sql, [id]);
  const row = (rows as unknown[])[0];
  return (row ?? null) as unknown as DisenoPatRow | null;
}

/* ------------ Update ------------ */
export async function actualizarDisenoPat(
  input: DisenoPatUpdateInput
): Promise<{ ok: true }> {
  const sql = `
    UPDATE diseno_pat
    SET
      nombre = COALESCE($2, nombre),
      ancho_mm = COALESCE($3, ancho_mm),
      alto_mm = COALESCE($4, alto_mm),
      dpi_previsualizacion = COALESCE($5, dpi_previsualizacion),
      lienzo_json = COALESCE($6::jsonb, lienzo_json),
      estado = COALESCE($7, estado),
      actualizado_en = NOW()
    WHERE id = $1::bigint
  `;

  await query(sql, [
    input.id,
    input.nombre ?? null,
    input.ancho_mm ?? null,
    input.alto_mm ?? null,
    input.dpi_previsualizacion ?? null,
    input.lienzo_json ?? null,
    input.estado ?? null,
  ]);

  return { ok: true as const };
}

/* ------------ (Opcional) Update estado simple ------------ */
export async function actualizarEstadoDisenoPat(
  id: string,
  estado: EstadoDiseno
): Promise<{ ok: true }> {
  const sql = `
    UPDATE diseno_pat
    SET estado = $2, actualizado_en = NOW()
    WHERE id = $1::bigint
  `;
  await query(sql, [id, estado]);
  return { ok: true as const };
}
