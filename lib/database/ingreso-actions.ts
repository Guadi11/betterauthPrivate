'use server'

import { darSalida } from '@/lib/database/ingreso-queries';

export async function realizarSalida(id_ingreso: number) {
  try {
    const resultado = await darSalida(id_ingreso);
    return { success: true, data: resultado };
  } catch (error) {
    console.error("Error al dar salida:", error);
    return { success: false, error: "No se pudo registrar la salida" };
  }
}
