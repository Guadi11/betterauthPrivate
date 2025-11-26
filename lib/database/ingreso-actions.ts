'use server'

import { IngresoConSolicitanteSchema } from '@/lib/zod/ingreso-schemas';
import { registrarSalida, insertarIngreso } from '@/lib/database/ingreso-queries';
import { z } from 'zod';
import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';
import { DatabaseError } from 'pg';
import { requireUserId } from "@/lib/auth/session"; // Importante: Auth

// Tipos de respuesta actualizados
type SalidaOK = { success: true; };
type SalidaErr = {
  success: false;
  error: string;
  code?: string; // Para identificar el tipo de error en el frontend
};
export type RealizarSalidaResult = SalidaOK | SalidaErr;

/**
 * Esquema para validar los datos de salida que vienen del cliente
 */
const SalidaSchema = z.object({
    id_ingreso: z.number(),
    fecha_egreso: z.date().optional(), // Si no viene, se usa new Date()
    motivo: z.string().optional(),     // Solo necesario si > 24h
});

export async function realizarSalida(rawInput: z.infer<typeof SalidaSchema>): Promise<RealizarSalidaResult> {
  
  const validation = SalidaSchema.safeParse(rawInput);
  if(!validation.success) {
      return { success: false, error: "Datos de salida inválidos" };
  }
  
  const { id_ingreso, fecha_egreso, motivo } = validation.data;
  // Usamos la fecha provista o la actual si no vino ninguna
  const fechaFinal = fecha_egreso ?? new Date();

  try {
    const userId = await requireUserId(); // Auditoría: ¿Quién cierra?

    const resultado = await registrarSalida(id_ingreso, userId, fechaFinal, motivo);
    
    if (!resultado) {
      return {
        success: false,
        error: 'El ingreso no existe o ya tiene registrada la salida.',
      };
    }
    return { success: true };

  } catch (err: unknown) {
    const e = err as DatabaseError;
    
    // Manejo del error específico del Trigger (> 24h sin motivo)
    // El trigger lanza RAISE EXCEPTION que llega como 'P0001' (default raise) o un error interno.
    // Buscamos el mensaje de texto que definimos en el trigger.
    
    const errorMsg = e.message || '';
    
    // Si el trigger salta pidiendo motivo (validacion > 24h)
    if (errorMsg.includes('motivo de cierre fuera de término')) {
        return {
            success: false,
            error: 'El ingreso supera las 24hs. Se requiere justificación.',
            code: 'REQUIERE_MOTIVO_CIERRE' // El frontend usará esto para abrir el Modal
        };
    }

    // Si el trigger salta por fecha egreso < fecha ingreso
    if (errorMsg.includes('anterior a la fecha de ingreso')) {
        return {
            success: false,
            error: 'La fecha de egreso no puede ser anterior al ingreso.',
            code: 'FECHA_INVALIDA'
        };
    }

    console.error("Error al cerrar ingreso:", e);
    return {
      success: false,
      error: e.message ?? 'No se pudo registrar la salida.',
      code: e.code
    };
  }
}

export async function darIngreso(documento: string, data: z.infer<typeof IngresoConSolicitanteSchema>) {
  const { ingreso, solicitante } = data;

  // Validar Auth
  let userId: string;
  try {
      userId = await requireUserId();
  } catch (e) {
    console.error("Error de autenticacion:", e);
    
      return { ok: false as const, type: 'auth', field: 'root', message: 'No se pudo verificar la sesion del usuario'};
  }

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
      abierto_por: userId, // Auditoría
    });

    return { ok: true as const };
  } catch (err: unknown) {
    const e = err as DatabaseError;
    const pgCode = e.code;
    const constraint = e.constraint;

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
    
    // ... resto de errores igual ...

    return {
      ok: false as const,
      type: 'desconocido',
      field: 'root',
      message: 'Ocurrió un error al registrar el ingreso.',
      meta: { code: pgCode, constraint, detail: e.detail ?? null },
    };
  }
}