import { query } from '@/lib/database/db';
import { unstable_noStore as noStore } from 'next/cache';

export interface Ingreso {
  id_ingreso: number;
  documento: string;
  nro_tarjeta: string;
  fecha_ingreso: string;
  fecha_egreso: string | null;
  lugar_visita: string;
  motivo: string;
  observacion: string;
  identificador_solicitante: string;
}

export interface IngresoConSolicitante extends Ingreso {
  tipo_identificador: string;
  jerarquia: string;
  destino: string;
  telefono: string;
  nombre_solicitante: string;
}

export async function obtenerIngresosPorDocumento(documento: string): Promise<IngresoConSolicitante[]> {
  noStore();

  const queryText = `
    SELECT *
    FROM vista_ingresos_con_solicitante
    WHERE documento = $1
    ORDER BY fecha_ingreso DESC
  `;

  try {
    const result = await query(queryText, [documento]);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    throw new Error('No se pudieron obtener los ingresos.');
  }
}

export async function darSalida(id_ingreso: number) {
  const now = new Date();
  const result = await query(
    'UPDATE ingreso_por_dia SET fecha_egreso = $1 WHERE id_ingreso = $2 RETURNING *;',
    [now, id_ingreso]
  );
  return result.rows[0]; // opcional, para verificar que se actualizó
}
