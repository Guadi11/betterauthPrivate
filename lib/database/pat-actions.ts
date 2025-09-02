// pat-actions.ts
'use server';

import { query } from '@/lib/database/db';
import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';

export type ConfeccionarPatInput = {
  pat: {
    fecha_extension: string;     // YYYY-MM-DD
    fecha_vencimiento: string;   // YYYY-MM-DD
    tipo_zona: 'ZC' | 'ZR' | 'HN' | 'PS' | 'OT';
    acceso_pat: string;
    nro_interno: string;
    causa_motivo_pat: string;
  };
  solicitante: {
    identificador: string;
    tipo_identificador: 'MR' | 'DNI';
    nombre: string;
    jerarquia: string;
    destino: string;
    telefono: string;
  };
};

export async function confeccionarPAT(
  documento: string,
  data: ConfeccionarPatInput
): Promise<{ ok: true } | { ok: false; type: string; field: string; message: string; meta?: any }> {
  const { pat, solicitante } = data;

  try {
    // 1) Upsert solicitante (mismo criterio que ingreso)
    const existente = await obtenerSolicitanteConId(solicitante.identificador);
    if (!existente) {
      await insertarSolicitante(solicitante);
    }

    //Generar codigo de seguridad - Por ahora hardcodeado
    const codigoDeSeguridad = 1;
    // 2) Insert PAT
    const sql = `
      INSERT INTO pases_acceso_transitorio (documento_registro, identificador_solicitante, nro_interno, fecha_extension, fecha_vencimiento, tipo_zona, acceso_pat, causa_motivo_pat, codigo_de_seguridad)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
      `;
    await query(sql, [
      documento,
      solicitante.identificador,
      String(pat.nro_interno ?? '').trim(),
      pat.fecha_extension,
      pat.fecha_vencimiento,
      pat.tipo_zona,
      String(pat.acceso_pat ?? '').trim(),
      String(pat.causa_motivo_pat ?? '').trim(),
      codigoDeSeguridad,
    ]);

    return { ok: true as const };
  } catch (err: any) {
    // Manejo similar al de ingreso-actions.ts
    const pgCode = err?.code;
    const constraint = err?.constraint;

    if (pgCode === '23503') {
      // FK (registro o solicitante inexistente)
      return {
        ok: false as const,
        type: 'fk_violation',
        field: 'root',
        message: 'No se encontró el registro o solicitante en la base de datos.',
        meta: { code: pgCode, constraint, detail: err?.detail ?? null },
      };
    }

    if (pgCode === '23514') {
      // Check (si definís alguno, p.ej. fecha_vencimiento >= fecha_extension)
      return {
        ok: false as const,
        type: 'check_violation',
        field: 'pat.fecha_vencimiento',
        message: 'Los datos no cumplen las restricciones (verificar fechas o tipo).',
        meta: { code: pgCode, constraint, detail: err?.detail ?? null },
      };
    }

    if (pgCode === '23505') {
      // Unique (por si definís alguna combinación única)
      return {
        ok: false as const,
        type: 'unique_violation',
        field: 'root',
        message: 'Ya existe un PAT con esos datos.',
        meta: { code: pgCode, constraint, detail: err?.detail ?? null },
      };
    }

    return {
      ok: false as const,
      type: 'desconocido',
      field: 'root',
      message: 'Ocurrió un error al confeccionar el PAT.',
      meta: { code: pgCode, constraint, detail: err?.detail ?? null },
    };
  }
}
