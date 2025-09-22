import { query } from '@/lib/database/db';

export type EstadoDiseno = 'borrador' | 'publicado' | 'archivado';

export interface DisenoPatInsert {
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  lienzo_json: unknown;
  estado: EstadoDiseno;
  creado_por: string;
  creado_en: string;       // ISO string
  actualizado_en: string;  // ISO string
}
export interface DisenoPat {
  id: string;
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  lienzo_json: unknown;     // Konva/Fabric JSON u otro
  estado: EstadoDiseno;
  creado_por: string;
  creado_en: string;        // ISO
  actualizado_en: string;   // ISO
}

export interface DisenoPatUpdateInput {
  id: string;
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  lienzo_json: unknown;
  estado: EstadoDiseno;
}

export async function insertarDisenoPat(data: DisenoPatInsert): Promise<{ id: number }> {
  const sql = `
    INSERT INTO diseno_pat
      (nombre, ancho_mm, alto_mm, dpi_previsualizacion, lienzo_json, estado, creado_por, creado_en, actualizado_en)
    VALUES
      ($1,     $2,       $3,      $4,                  $5,         $6,     $7,         $8,        $9)
    RETURNING id;
  `;

  const params: unknown[] = [
    data.nombre,
    data.ancho_mm,
    data.alto_mm,
    data.dpi_previsualizacion,
    JSON.stringify(data.lienzo_json),
    data.estado,
    data.creado_por,
    data.creado_en,
    data.actualizado_en,
  ];

  const res = await query(sql, params);
  const firstRow: unknown = (res as unknown as { rows: unknown[] }).rows?.[0];
  const idValue =
    typeof firstRow === 'object' && firstRow !== null
      ? (firstRow as Record<string, unknown>)['id']
      : undefined;

  const id =
    typeof idValue === 'number'
      ? idValue
      : typeof idValue === 'string'
        ? Number.parseInt(idValue, 10)
        : NaN;

  if (!Number.isFinite(id)) {
    throw new Error('No se pudo recuperar el id del diseño insertado.');
  }

  return { id };
}

/* ---------------- Listado para la tabla ---------------- */

export interface DisenoPatListItem {
  id: number;
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  estado: EstadoDiseno;
  actualizado_en: string; // ISO string (timestamp with time zone)
}

function asNumber(x: unknown): number {
  if (typeof x === 'number') return x;
  if (typeof x === 'string' && x.trim() !== '') {
    const n = Number(x);
    if (!Number.isNaN(n)) return n;
  }
  throw new Error('Valor numérico inválido en fila de diseno_pat.');
}

function asString(x: unknown): string {
  if (typeof x === 'string') return x;
  if (x instanceof Date) return x.toISOString();
  throw new Error('Valor string inválido en fila de diseno_pat.');
}

function rowToListItem(row: unknown): DisenoPatListItem {
  const r = row as Record<string, unknown>;
  const estado = asString(r.estado) as EstadoDiseno;
  return {
    id: asNumber(r.id),
    nombre: asString(r.nombre),
    ancho_mm: asNumber(r.ancho_mm),
    alto_mm: asNumber(r.alto_mm),
    dpi_previsualizacion: asNumber(r.dpi_previsualizacion),
    estado,
    actualizado_en: asString(r.actualizado_en),
  };
}

/**
 * Lista diseños, opcionalmente filtrando por estado.
 * Devuelve solo las columnas necesarias para la tabla.
 */
export async function listarDisenos(
  estado?: EstadoDiseno,
): Promise<DisenoPatListItem[]> {
  if (estado) {
    const sql = `
      SELECT id, nombre, ancho_mm, alto_mm, dpi_previsualizacion, estado, actualizado_en
      FROM diseno_pat
      WHERE estado = $1
      ORDER BY actualizado_en DESC
    `;
    const { rows } = await query(sql, [estado]);
    return (rows as unknown[]).map(rowToListItem);
  }

  const sql = `
    SELECT id, nombre, ancho_mm, alto_mm, dpi_previsualizacion, estado, actualizado_en
    FROM diseno_pat
    ORDER BY actualizado_en DESC
  `;
  const { rows } = await query(sql, []);
  return (rows as unknown[]).map(rowToListItem);
}

export async function obtenerDisenoPatPorId(id: string): Promise<DisenoPat | null> {
  const sql = `
    SELECT id, nombre, ancho_mm, alto_mm, dpi_previsualizacion, lienzo_json, estado,
           creado_por, to_char(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS creado_en,
           to_char(actualizado_en, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS actualizado_en
    FROM diseno_pat
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] ?? null;
}

export async function actualizarDisenoPat(input: DisenoPatUpdateInput): Promise<{ ok: true }> {
  const sql = `
    UPDATE diseno_pat
      SET nombre = $2,
          ancho_mm = $3,
          alto_mm = $4,
          dpi_previsualizacion = $5,
          lienzo_json = $6,
          estado = $7,
          actualizado_en = NOW()
    WHERE id = $1
  `;
  await query(sql, [
    input.id,
    input.nombre,
    input.ancho_mm,
    input.alto_mm,
    input.dpi_previsualizacion,
    input.lienzo_json,
    input.estado,
  ]);
  return { ok: true };
}