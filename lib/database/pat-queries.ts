// lib/database/pat-queries.ts
import { query } from '@/lib/database/db';

export interface PaseAccesoTransitorio {
  id: number;
  documento_registro: string;
  identificador_solicitante: string;
  nro_interno: string;              // '0000'..'99999' (mantiene ceros a la izquierda)
  fecha_extension: string;          // 'YYYY-MM-DD'
  fecha_vencimiento: string;        // 'YYYY-MM-DD'
  tipo_zona: string;                // hasta 2 chars
  acceso_pat: string;
  causa_motivo_pat: string;
  codigo_de_seguridad: string;
}

export interface PaseConSolicitante extends PaseAccesoTransitorio {
  nombre_solicitante: string;
  tipo_identificador: string | null;
  jerarquia: string | null;
  destino: string | null;
  telefono: string | null;
}

/** 1) Insertar PAT → devuelve id generado */
export async function insertarPAT(data: {
  documento_registro: string;
  identificador_solicitante: string;
  nro_interno: string;              // ya normalizado (solo dígitos, 4–5 chars)
  fecha_extension: string;          // 'YYYY-MM-DD'
  fecha_vencimiento: string;        // 'YYYY-MM-DD'
  tipo_zona: string;                // 1–2 chars
  acceso_pat: string;
  causa_motivo_pat: string;
  codigo_de_seguridad: string;
}): Promise<number> {
  const sql = `
    INSERT INTO pases_acceso_transitorio (
      documento_registro,
      identificador_solicitante,
      nro_interno,
      fecha_extension,
      fecha_vencimiento,
      tipo_zona,
      acceso_pat,
      causa_motivo_pat,
      codigo_de_seguridad
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id
  `;

  const params = [
    data.documento_registro,
    data.identificador_solicitante,
    data.nro_interno,
    data.fecha_extension,
    data.fecha_vencimiento,
    data.tipo_zona,
    data.acceso_pat,
    data.causa_motivo_pat,
    data.codigo_de_seguridad,
  ];

  const result = await query(sql, params);
  return result.rows[0].id as number;
}

/** 2) Obtener todos los PAT de un registro (orden: más reciente primero) */
export async function obtenerPATsPorDocumento(documento: string): Promise<PaseConSolicitante[]> {
  const sql = `
    SELECT
      p.id,
      p.documento_registro,
      p.identificador_solicitante,
      p.nro_interno,
      p.fecha_extension,
      p.fecha_vencimiento,
      p.tipo_zona,
      p.acceso_pat,
      p.causa_motivo_pat,
      p.codigo_de_seguridad,
      s.nombre  AS nombre_solicitante,
      s.tipo_identificador,
      s.jerarquia,
      s.destino,
      s.telefono
    FROM pases_acceso_transitorio p
    JOIN solicitante s
      ON s.identificador = p.identificador_solicitante
    WHERE p.documento_registro = $1
    ORDER BY p.fecha_extension DESC, p.id DESC
  `;
  const result = await query(sql, [documento]);
  return result.rows as PaseConSolicitante[];
}
