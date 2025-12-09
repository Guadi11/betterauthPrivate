// pat-actions.ts
'use server';

import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';
import { insertarPAT } from '@/lib/database/pat-queries';
import { isDatabaseError } from '@/lib/database/db'; // Asumo que tienes esto de tu código anterior
import { ConfeccionarPatSchema, ConfeccionarPatFormData } from '@/lib/zod/pat-schemas';

type PatResult = 
  | { ok: true } 
  | { ok: false; message: string; field?: string };

export async function confeccionarPAT(
  documento: string, 
  rawData: ConfeccionarPatFormData
): Promise<PatResult> {
  
  // 1. Validar los datos con Zod en el servidor (Capa de seguridad extra)
  const parsed = ConfeccionarPatSchema.safeParse(rawData);

  if (!parsed.success) {
    // Si falla la validación, devolvemos el primer error encontrado
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      message: firstError.message,
      field: firstError.path.join('.') // ej: "pat.fecha_vencimiento"
    };
  }

  const { pat, solicitante } = parsed.data;

  try {
    // 2. Lógica de Solicitante (Upsert)
    const existente = await obtenerSolicitanteConId(solicitante.identificador);
    if (!existente) {
      await insertarSolicitante(solicitante);
    }

    // 3. Insertar PAT
    // Hardcodeo '1' como en tu ejemplo, o podrías agregarlo al form si es dinámico
    const codigoDeSeguridad = '1'; 

    await insertarPAT({
      documento_registro: documento,
      identificador_solicitante: solicitante.identificador,
      nro_interno: pat.nro_interno,
      fecha_extension: pat.fecha_extension,
      fecha_vencimiento: pat.fecha_vencimiento,
      tipo_zona: pat.tipo_zona,
      acceso_pat: pat.acceso_pat,
      causa_motivo_pat: pat.causa_motivo_pat,
      codigo_de_seguridad: codigoDeSeguridad,
    });

    return { ok: true };

  } catch (err: unknown) {
    console.error("Error al confeccionar PAT:", err);

    if (isDatabaseError(err)) {
      if (err.code === '23505') { // Unique violation
        return { ok: false, message: 'Ya existe un PAT duplicado para estos datos.' };
      }
      if (err.code === '23503') { // FK violation
        return { ok: false, message: 'Error de referencia: Verifique el documento de registro.' };
      }
    }

    return { ok: false, message: 'Error interno al guardar el PAT.' };
  }
}