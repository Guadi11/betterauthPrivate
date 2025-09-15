// lib/database/diseno-pat-queries.ts
import { query } from "@/lib/database/db";
import { JsonValue } from "@/types/json";

export type EstadoDiseno = "borrador" | "publicado" | "archivado";

export interface DisenoPat {
  id: number;
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  lienzo_json: JsonValue;     // ✅ antes: JSON
  estado: EstadoDiseno;
  creado_por: string;
  actualizado_por: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface InsertarDisenoInput {
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion?: number;
  lienzo_json: JsonValue;     // ✅ antes: JSON
  estado?: EstadoDiseno;
  creado_por: string;
}

export interface RecursoDisenoPat {
  id: number;
  diseno_id: number;
  nombre: string;
  mime_type: string;
  datos: Buffer;        // Omitir en listados si es pesado
  creado_en: string;
}

export async function insertarDisenoPat(input: InsertarDisenoInput): Promise<DisenoPat> {
  const sql = `
    INSERT INTO diseno_pat
      (nombre, ancho_mm, alto_mm, dpi_previsualizacion, lienzo_json, estado, creado_por)
    VALUES ($1, $2, $3, COALESCE($4, 300), $5, COALESCE($6, 'borrador'), $7)
    RETURNING *;
  `;
  const params = [
    input.nombre,
    input.ancho_mm,
    input.alto_mm,
    input.dpi_previsualizacion ?? null,
    input.lienzo_json,
    input.estado ?? null,
    input.creado_por,
  ];
  const { rows } = await query(sql, params);
  return rows[0];
}

export interface ActualizarDisenoInput {
  nombre?: string;
  ancho_mm?: number;
  alto_mm?: number;
  dpi_previsualizacion?: number;
  lienzo_json?: JsonValue;
  estado?: EstadoDiseno;
  actualizado_por: string;
}

export async function actualizarDisenoPat(id: number, input: ActualizarDisenoInput): Promise<DisenoPat> {
  const sql = `
    UPDATE diseno_pat SET
      nombre = COALESCE($2, nombre),
      ancho_mm = COALESCE($3, ancho_mm),
      alto_mm = COALESCE($4, alto_mm),
      dpi_previsualizacion = COALESCE($5, dpi_previsualizacion),
      lienzo_json = COALESCE($6, lienzo_json),
      estado = COALESCE($7, estado),
      actualizado_por = $8
    WHERE id = $1
    RETURNING *;
  `;
  const params = [
    id,
    input.nombre ?? null,
    input.ancho_mm ?? null,
    input.alto_mm ?? null,
    input.dpi_previsualizacion ?? null,
    input.lienzo_json ?? null,
    input.estado ?? null,
    input.actualizado_por,
  ];
  const { rows } = await query(sql, params);
  return rows[0];
}

export async function obtenerDisenoPorId(id: number): Promise<DisenoPat | null> {
  const { rows } = await query(`SELECT * FROM diseno_pat WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listarDisenos(estado?: EstadoDiseno): Promise<DisenoPat[]> {
  if (estado) {
    const { rows } = await query(`SELECT * FROM diseno_pat WHERE estado = $1 ORDER BY actualizado_en DESC`, [estado]);
    return rows;
  }
  const { rows } = await query(`SELECT * FROM diseno_pat ORDER BY actualizado_en DESC`, []);
  return rows;
}

export async function publicarDiseno(id: number, actualizado_por: string): Promise<DisenoPat> {
  const { rows } = await query(
    `UPDATE diseno_pat SET estado = 'publicado', actualizado_por = $2 WHERE id = $1 RETURNING *`,
    [id, actualizado_por]
  );
  return rows[0];
}

export async function archivarDiseno(id: number, actualizado_por: string): Promise<DisenoPat> {
  const { rows } = await query(
    `UPDATE diseno_pat SET estado = 'archivado', actualizado_por = $2 WHERE id = $1 RETURNING *`,
    [id, actualizado_por]
  );
  return rows[0];
}

// ---------- Recursos (assets) ----------
export interface InsertarRecursoInput {
  diseno_id: number;
  nombre: string;
  mime_type: string;
  datos: Buffer; // binario de la imagen/sello
}

export async function insertarRecursoDisenoPat(input: InsertarRecursoInput): Promise<RecursoDisenoPat> {
  const sql = `
    INSERT INTO recurso_diseno_pat (diseno_id, nombre, mime_type, datos)
    VALUES ($1, $2, $3, $4)
    RETURNING id, diseno_id, nombre, mime_type, creado_en;
  `;
  const { rows } = await query(sql, [input.diseno_id, input.nombre, input.mime_type, input.datos]);
  return rows[0];
}

export async function listarRecursosPorDiseno(diseno_id: number): Promise<Omit<RecursoDisenoPat, "datos">[]> {
  const sql = `
    SELECT id, diseno_id, nombre, mime_type, creado_en
    FROM recurso_diseno_pat WHERE diseno_id = $1 ORDER BY creado_en DESC
  `;
  const { rows } = await query(sql, [diseno_id]);
  return rows;
}

export async function obtenerRecursoBinario(id: number): Promise<RecursoDisenoPat | null> {
  const { rows } = await query(`SELECT * FROM recurso_diseno_pat WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

// ---------- Auditoría ----------
export interface RegistrarLogImpresionInput {
  pat_id: number;
  diseno_id: number;
  impreso_por: string;
  copias?: number;
  variables_resueltas: JsonValue; // JSON serializable
}

export async function registrarLogImpresion(input: RegistrarLogImpresionInput): Promise<void> {
  const sql = `
    INSERT INTO log_impresion_pat (pat_id, diseno_id, impreso_por, copias, variables_resueltas)
    VALUES ($1, $2, $3, COALESCE($4, 1), $5)
  `;
  await query(sql, [
    input.pat_id,
    input.diseno_id,
    input.impreso_por,
    input.copias ?? null,
    input.variables_resueltas,
  ]);
}
