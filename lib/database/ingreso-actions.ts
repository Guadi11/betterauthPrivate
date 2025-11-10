'use server'

import { IngresoConSolicitanteSchema } from '@/app/(protected)/(registros)/registro/[documento]/dar_ingreso/page';
import { darSalida, Ingreso, insertarIngreso } from '@/lib/database/ingreso-queries';
import { z } from 'zod';
import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';
import { DatabaseError } from 'pg';

type SalidaOK = { success: true; data: Ingreso };
type SalidaErr = {
  success: false;
  error: string;
  meta?: { code?: string; constraint?: string; detail?: string };
};
export type RealizarSalidaResult = SalidaOK | SalidaErr;

export async function realizarSalida(id_ingreso: number): Promise<RealizarSalidaResult> {
  try {
    const resultado = await darSalida(id_ingreso);
    if (!resultado) {
      // Nada para actualizar (ya tenía egreso o no existe)
      return {
        success: false,
        error: 'El ingreso no existe o ya tiene registrada la salida.',
      };
    }
    return { success: true, data: resultado };
  } catch (err: unknown) {
    const e = err as DatabaseError;
    const key = `${e.code ?? ''}|${e.constraint ?? ''}`;

    // Mensajes “amigables” por constraint/código
    const friendlyByKey: Record<string, string> = {
      // 23514 = check_violation
      '23514|chk_max_duracion_visita':
        'La visita excede la duración máxima permitida (24 h). No se puede registrar la salida automática. Use “Cerrar fuera de término”.',
    };

    const friendly = friendlyByKey[key];

    return {
      success: false,
      error: friendly ?? e.message ?? 'No se pudo registrar la salida.',
      meta: {
        code: e.code,
        constraint: e.constraint,
        // Algunos drivers tipan `detail` como opcional; lo sacamos de forma segura:
        detail: (e as unknown as { detail?: string }).detail,
      },
    };
  }
}

export async function darIngreso(documento: string, data: z.infer<typeof IngresoConSolicitanteSchema>) {
  const { ingreso, solicitante } = data;

  // Verificamos si el solicitante ya existe
  const solicitanteExistente = await obtenerSolicitanteConId(data.solicitante.identificador);
  if (!solicitanteExistente) {
    await insertarSolicitante(data.solicitante);
  }

  try {
    await insertarIngreso({
      documento,
      nro_tarjeta: ingreso.nro_tarjeta.prefijo + ingreso.nro_tarjeta.sufijo,
      lugar_visita: ingreso.lugar_visita,
      motivo: ingreso.motivo,
      observacion: ingreso.observacion,
      identificador_solicitante: solicitante.identificador,
    });

    return { ok: true as const };
  } catch (err: unknown) {
    // PostgreSQL
    // code: '23505' = unique_violation
    // code: '23514' = check_violation
    // code: '23503' = foreign_key_violation
    // code: '23502' = not_null_violation
    const e = err as DatabaseError;
    const pgCode = e.code;
    const constraint = e.constraint;

    // Mensajes amigables por caso
    if (pgCode === '23505' && constraint === 'ux_tarjeta_abierta') {
      return {
        ok: false as const,
        type: 'tarjeta_abierta',
        field: 'ingreso.nro_tarjeta.sufijo',
        message: 'La tarjeta indicada ya está asignada a un ingreso sin egreso.',
      };
    }

    if (pgCode === '23505' && constraint === 'ux_documento_abierto') {
      return {
        ok: false as const,
        type: 'documento_abierto',
        field: 'root',
        message: 'Este registro ya tiene un ingreso abierto. Primero registre el egreso.',
      };
    }

    if (pgCode === '23503' && constraint === 'fk_documento') {
      return {
        ok: false as const,
        type: 'registro_inexistente',
        field: 'root',
        message: 'No se encontró el registro (documento) en la base de datos.',
      };
    }

    if (pgCode === '23514' && constraint === 'chk_duracion_visita') {
      return {
        ok: false as const,
        type: 'duracion_invalida',
        field: 'root',
        message: 'La duración de la visita es inválida (egreso antes del ingreso o > 24hs).',
      };
    }

    // Fallback genérico: devolvemos info básica para debug
    return {
      ok: false as const,
      type: 'desconocido',
      field: 'root',
      message: 'Ocurrió un error al registrar el ingreso.',
      meta: { code: pgCode, constraint, detail: e.detail ?? null },
    };
  }
}