'use server'

import { IngresoConSolicitanteSchema } from '@/app/(protected)/(registros)/registro/[documento]/dar_ingreso/page';
import { darSalida, insertarIngreso } from '@/lib/database/ingreso-queries';
import { z } from 'zod';
import { insertarSolicitante, obtenerSolicitanteConId } from '@/lib/database/solicitante-queries';

export async function realizarSalida(id_ingreso: number) {
  try {
    const resultado = await darSalida(id_ingreso);
    return { success: true, data: resultado };
  } catch (error) {
    console.error("Error al dar salida:", error);
    return { success: false, error: "No se pudo registrar la salida" };
  }
}

export async function darIngreso(documento: string, data: z.infer<typeof IngresoConSolicitanteSchema>){
  const { ingreso, solicitante } = data;
  // Verificamos si el solicitante ya existe
  const solicitanteExistente = await obtenerSolicitanteConId(data.solicitante.identificador);

  if (!solicitanteExistente) {
    await insertarSolicitante(data.solicitante);
  }

  await insertarIngreso({
    documento: documento,
    nro_tarjeta: ingreso.nro_tarjeta,
    lugar_visita: ingreso.lugar_visita,
    motivo: ingreso.motivo,
    observacion: ingreso.observacion,
    identificador_solicitante: solicitante.identificador,
  });

  return { ok: true };
}