// pat-actions.ts
'use server';

import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';
import { insertarPAT } from '@/lib/database/pat-queries'; // 👈 nuevo import
import { isDatabaseError } from '@/lib/database/db';

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

type PgErrorMeta = {
  code?: string;
  constraint?: string | null;
  detail?: string | null;
};

type PatOk = { ok: true };

type PatError =
  | { ok: false; type: 'required' | 'validation'; field: string; message: string; meta: null }
  | { ok: false; type: 'fk_violation' | 'check_violation' | 'unique_violation' | 'desconocido'; field: string; message: string; meta: PgErrorMeta };

export type ConfeccionarPatResult = PatOk | PatError;

export async function confeccionarPAT(
  documento: string,
  data: ConfeccionarPatInput
): Promise<ConfeccionarPatResult> {
  try {
    // 0) Normalizar/validar todos los campos (obligatorios)
    const doc = documento?.trim();
    const pat = {
      fecha_extension: data.pat.fecha_extension?.trim(),
      fecha_vencimiento: data.pat.fecha_vencimiento?.trim(),
      tipo_zona: data.pat.tipo_zona?.trim(),
      acceso_pat: data.pat.acceso_pat?.trim(),
      nro_interno: data.pat.nro_interno?.trim(),
      causa_motivo_pat: data.pat.causa_motivo_pat?.trim(),
    };
    const solicitante = {
      identificador: data.solicitante.identificador?.trim(),
      tipo_identificador: data.solicitante.tipo_identificador?.trim() as 'MR' | 'DNI',
      nombre: data.solicitante.nombre?.trim(),
      jerarquia: data.solicitante.jerarquia?.trim(),
      destino: data.solicitante.destino?.trim(),
      telefono: data.solicitante.telefono?.trim(),
    };

    // Verificaciones “no vacío”
    const requiredPairs: Array<[string, string]> = [
      ['documento', doc],
      ['pat.fecha_extension', pat.fecha_extension],
      ['pat.fecha_vencimiento', pat.fecha_vencimiento],
      ['pat.tipo_zona', pat.tipo_zona],
      ['pat.acceso_pat', pat.acceso_pat],
      ['pat.nro_interno', pat.nro_interno],
      ['pat.causa_motivo_pat', pat.causa_motivo_pat],
      ['solicitante.identificador', solicitante.identificador],
      ['solicitante.tipo_identificador', solicitante.tipo_identificador],
      ['solicitante.nombre', solicitante.nombre],
      ['solicitante.jerarquia', solicitante.jerarquia],
      ['solicitante.destino', solicitante.destino],
      ['solicitante.telefono', solicitante.telefono],
    ];
    for (const [field, value] of requiredPairs) {
      if (!value) {
        return { ok: false as const, type: 'required', field, message: 'Campo obligatorio.', meta: null };
      }
    }

    // Formato nro_interno
    if (!/^\d{4,5}$/.test(pat.nro_interno)) {
      return { ok: false as const, type: 'validation', field: 'pat.nro_interno', message: 'Debe tener 4–5 dígitos.', meta: null };
    }

    // Fechas válidas y orden
    const ext = new Date(pat.fecha_extension);
    const ven = new Date(pat.fecha_vencimiento);
    if (Number.isNaN(ext.valueOf()) || Number.isNaN(ven.valueOf())) {
      return { ok: false as const, type: 'validation', field: 'pat.fecha_*', message: 'Fecha inválida.', meta: null };
    }
    if (ven < ext) {
      return { ok: false as const, type: 'validation', field: 'pat.fecha_vencimiento', message: 'Vencimiento no puede ser anterior a extensión.', meta: null };
    }

    // 1) Upsert solicitante
    const existente = await obtenerSolicitanteConId(solicitante.identificador);
    if (!existente) {
      await insertarSolicitante(solicitante);
    }

    // 2) Código de seguridad (varchar)
    const codigoDeSeguridad = '1';

    // 3) Insert PAT (sin nulls)
    await insertarPAT({
      documento_registro: doc,
      identificador_solicitante: solicitante.identificador,
      nro_interno: pat.nro_interno,
      fecha_extension: pat.fecha_extension,
      fecha_vencimiento: pat.fecha_vencimiento,
      tipo_zona: pat.tipo_zona,
      acceso_pat: pat.acceso_pat,
      causa_motivo_pat: pat.causa_motivo_pat,
      codigo_de_seguridad: codigoDeSeguridad,
    });

    return { ok: true as const };
  } catch (err: unknown) {
  if (isDatabaseError(err)) {
    const pgCode = err.code;
    const constraint = err.constraint as string | undefined; // si tu versión no lo tipa
    const detail = err.detail as string | undefined;

    if (pgCode === '23503') {
      return { ok: false, type: 'fk_violation', field: 'root', message: 'No se encontró el registro o solicitante en la base de datos.', meta: { code: pgCode, constraint, detail } };
    }
    if (pgCode === '23514') {
      return { ok: false, type: 'check_violation', field: 'pat.fecha_vencimiento', message: 'Los datos no cumplen las restricciones (verificar fechas o tipo).', meta: { code: pgCode, constraint, detail } };
    }
    if (pgCode === '23505') {
      return { ok: false, type: 'unique_violation', field: 'root', message: 'Ya existe un PAT con esos datos.', meta: { code: pgCode, constraint, detail } };
    }

    return { ok: false, type: 'desconocido', field: 'root', message: 'Ocurrió un error al confeccionar el PAT.', meta: { code: pgCode, constraint, detail } };
  }

  // Error no-PG (runtime, etc.)
  return { ok: false, type: 'desconocido', field: 'root', message: 'Ocurrió un error al confeccionar el PAT.', meta: { code: undefined, constraint: undefined, detail: String(err) } };
}
}
