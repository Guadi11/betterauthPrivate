'use server'

import { IngresoConSolicitanteSchema } from '@/app/(protected)/(registros)/registro/[documento]/dar_ingreso/page';
import { darSalida } from '@/lib/database/ingreso-queries';
import { z } from 'zod';
import { query } from './db';

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
  const solicitanteExistente = await query(
    `SELECT 1 FROM solicitante WHERE identificador = $1`,
    [solicitante.identificador]
  );

  if (solicitanteExistente.rowCount === 0) {
    await query(
      `INSERT INTO solicitante (identificador, tipo_identificador, nombre, jerarquia, destino, telefono)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        solicitante.identificador,
        solicitante.tipo_identificador,
        solicitante.nombre,
        solicitante.jerarquia,
        solicitante.destino,
        solicitante.telefono,
      ]
    );
  }

  await query(
    `INSERT INTO ingreso_por_dia (documento, nro_tarjeta, fecha_ingreso, lugar_visita, motivo, observacion, identificador_solicitante)
     VALUES ($1, $2, NOW(), $3, $4, $5, $6)`,
    [
      documento,
      ingreso.nro_tarjeta,
      ingreso.lugar_visita,
      ingreso.motivo,
      ingreso.observacion ?? null,
      solicitante.identificador,
    ]
  );

  return { ok: true };
}