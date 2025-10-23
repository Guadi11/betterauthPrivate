import { query } from "@/lib/database/db";
import type { RecursoRow } from "@/lib/types/recurso";
import type { RecursoFiltro } from "@/lib/zod/recurso-schemas";

// Listado con filtros y contador de usos
export async function listarRecursos(filtro: RecursoFiltro): Promise<{ items: RecursoRow[]; total: number; }> {
    const params: unknown[] = [];
    const where: string[] = [];

    if (filtro.search) {
        params.push(`%${filtro.search}%`);
        where.push(`nombre ILIKE $${params.length}`);
    }
    if (filtro.mime) {
        params.push(filtro.mime);
        where.push(`mime_type = $${params.length}`);
    }
    if (filtro.estado) {
        params.push(filtro.estado);
        where.push(`estado = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // total
    const totalRes = await query(`SELECT COUNT(*)::text as count FROM recurso ${whereSql}`, params);
    const total = parseInt(totalRes.rows[0]?.count ?? "0", 10);

    // items
    params.push(filtro.limit ?? 24);
    params.push(filtro.offset ?? 0);

    const itemsRes = await query(
        `SELECT id::text, nombre, mime_type, sha256, bytes_size, ancho_px, alto_px, estado, creado_por, creado_en,
            COALESCE(u.usos, 0) AS usos
        FROM recurso r
        LEFT JOIN (
            SELECT recurso_id, COUNT(*)::int AS usos
            FROM recurso_en_diseno GROUP BY recurso_id
        ) u ON u.recurso_id = r.id
        ${whereSql}
        ORDER BY creado_en DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
        `,
        params,
    );

    return { items: itemsRes.rows, total };
}

export async function obtenerRecurso(id: string): Promise<RecursoRow | null>{
    const res = await query(
    `SELECT id::text, nombre, mime_type, sha256, bytes_size, ancho_px, alto_px, estado, creado_por, creado_en
    FROM recurso WHERE id = $1`,
    [id],
    );
    return res.rows[0] ?? null;
}

// Solo bytes para streaming
export async function obtenerRecursoBytes(id: string): Promise<{ mime_type: "image/png"|"image/jpeg"; sha256: string; datos: Buffer } | null> {
    const res = await query(
        `SELECT mime_type, sha256, datos 
        FROM recurso 
        WHERE id = $1 AND estado = 'activo'`,
        [id],
    );
    const row = res.rows[0];
    return row ? { mime_type: row.mime_type, sha256: row.sha256, datos: row.datos } : null;
}

export async function obtenerThumbBytes(id: string): Promise<{ 
    mime_type: "image/png";
    sha256: string;
    datos: Buffer } | null> {
    const res = await query(
        `SELECT sha256, thumb_datos FROM recurso WHERE id = $1 AND estado =
        'activo'`,
        [id],
    );
    const row = res.rows[0];
    if (!row || !row.thumb_datos) return null;
    return { mime_type: "image/png", sha256: row.sha256, datos: row.thumb_datos };
}

export async function obtenerRecursoPorSha(sha256: string): Promise<RecursoRow | null> {
    const res = await query(
        `SELECT id::text, nombre, mime_type, sha256, bytes_size, ancho_px,
    alto_px, estado, creado_por, creado_en
        FROM recurso WHERE sha256 = $1`,
        [sha256],
    );
    return res.rows[0] ?? null;
}

export async function insertarRecurso(input: {
        nombre: string;
        mime_type: "image/png"|"image/jpeg";
        sha256: string;
        bytes_size: number;
        ancho_px: number;
        alto_px: number;
        datos: Buffer;
        thumb_datos: Buffer | null;
        creado_por?: string;
    }): Promise<RecursoRow> {
        const res = await query(
            `INSERT INTO recurso (nombre, mime_type, sha256, bytes_size, ancho_px,
            alto_px, datos, thumb_datos, estado, creado_por)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'activo', COALESCE($9,'system'))
            ON CONFLICT (sha256) DO UPDATE SET estado='activo'
            RETURNING id::text, nombre, mime_type, sha256, bytes_size, ancho_px,
            alto_px, estado, creado_por, creado_en` ,
        [
            input.nombre,
            input.mime_type,
            input.sha256,
            input.bytes_size,
            input.ancho_px,
            input.alto_px,
            input.datos,
            input.thumb_datos,
            input.creado_por ?? null,
        ],
        );
        return res.rows[0];
    }

export async function archivarRecurso(id: string): Promise<{ ok: true } | {
    ok: false; motivo: "en_uso" | "no_existe"; usos?: number }> {
    // bloquear si hay usos
    const usosRes = await query(`
        SELECT COUNT(*)::text AS c FROM recurso_en_diseno WHERE recurso_id = $1`
        ,[id]);
    const usos = parseInt(usosRes.rows[0]?.c ?? "0", 10);
    if (usos > 0) return { ok: false, motivo: "en_uso", usos };
    const upd = await query(`UPDATE recurso SET estado='archivado' WHERE id =
    $1`, [id]);
    if (upd.rowCount && upd.rowCount > 0) return { ok: true };
    return { ok: false, motivo: "no_existe" };
}


export async function vincularRecursoADiseno(disenoId: string, recursoId: string): Promise<void> {
    await query(
        `INSERT INTO recurso_en_diseno (diseno_id, recurso_id)
        VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [disenoId, recursoId],
    );
}

export async function desvincularRecursoDeDiseno(disenoId: string, recursoId: string): Promise<void> {
    await query(`DELETE FROM recurso_en_diseno WHERE diseno_id=$1 AND
    recurso_id=$2`, [disenoId, recursoId]);
}

export async function listarRecursosDeDiseno(disenoId: string): Promise<RecursoRow[]> {
    const res = await query(
        `SELECT r.id::text, r.nombre, r.mime_type, r.sha256, r.bytes_size,
        r.ancho_px, r.alto_px, r.estado, r.creado_por, r.creado_en
        FROM recurso r
        JOIN recurso_en_diseno rd ON rd.recurso_id = r.id
        WHERE rd.diseno_id = $1
        ORDER BY r.creado_en DESC`,
        [disenoId],
    );
    return res.rows;
}

export async function syncRecursosDeDiseno(disenoId: string, recursoIdsActuales: readonly string[]): Promise<void> {
    // Quitar los que ya no están
    await query(
    `DELETE FROM recurso_en_diseno
    WHERE diseno_id = $1 AND recurso_id NOT IN (
    SELECT UNNEST($2::bigint[])
    )`,
    [disenoId, recursoIdsActuales],
    );
    // Agregar los nuevos
    await query(
    `INSERT INTO recurso_en_diseno (diseno_id, recurso_id)
    SELECT $1, UNNEST($2::bigint[])
    ON CONFLICT DO NOTHING`,
    [disenoId, recursoIdsActuales],
    );
}
