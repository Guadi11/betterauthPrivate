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

export interface IngresoCompleto extends IngresoConSolicitante {
  nombre_registro: string;
  apellido_registro: string;
  tipo_documento_registro: string;
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

export async function darSalida(id_ingreso: number): Promise<Ingreso | null> {
  const result = await query(
    `UPDATE ingreso_por_dia
     SET fecha_egreso = NOW()
     WHERE id_ingreso = $1 AND fecha_egreso IS NULL
     RETURNING *;`,
    [id_ingreso]
  );

  // Si no se afectó ninguna fila, ya estaba cerrado o no existe.
  return (result.rows[0] ?? null) as Ingreso | null;
}


export async function insertarIngreso(data: {
  documento: string;
  nro_tarjeta: string;
  lugar_visita: string;
  motivo: string;
  observacion?: string;
  identificador_solicitante: string;
}) {
  const queryText = `
    INSERT INTO ingreso_por_dia (
      documento, nro_tarjeta, fecha_ingreso, lugar_visita, motivo, observacion, identificador_solicitante
    ) VALUES ($1, $2, NOW(), $3, $4, $5, $6)
  `;

  return query(queryText, [
    data.documento,
    data.nro_tarjeta,
    data.lugar_visita,
    data.motivo,
    data.observacion ?? null,
    data.identificador_solicitante,
  ]);
}

export async function obtenerIngresosCompletos(): Promise<IngresoCompleto[]> {
  const res = await query(`
    SELECT 
      id_ingreso,
      documento,
      nro_tarjeta,
      fecha_ingreso,
      fecha_egreso,
      lugar_visita,
      motivo,
      observacion,
      identificador_solicitante,
      tipo_identificador,
      jerarquia,
      destino,
      telefono,
      nombre_solicitante,
      r.nombre AS nombre_registro,
      r.apellido AS apellido_registro,
      r.tipo_documento AS tipo_documento_registro
    FROM vista_ingresos_completa r
    ORDER BY fecha_ingreso DESC
  `);  
  
  return res.rows as IngresoCompleto[];
}