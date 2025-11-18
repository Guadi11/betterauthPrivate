import { query } from '@/lib/database/db';
import { unstable_noStore as noStore } from 'next/cache';

export interface Ingreso {
  id_ingreso: number;
  documento: string;
  nro_tarjeta: string;
  fecha_ingreso: Date; // Cambiado a Date para mejor manejo en TS
  fecha_egreso: Date | null;
  lugar_visita: string;
  motivo: string;
  observacion: string;
  identificador_solicitante: string;
  // Nuevos campos de auditoría
  abierto_por?: string;
  abierto_en?: Date;
  cerrado_por?: string;
  cerrado_en?: Date;
  cierre_fuera_de_tiempo?: boolean;
  motivo_cierre_fuera_de_termino?: string;
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

/**
 * Registra la salida de una visita.
 * Ahora acepta fecha explícita y motivo para soportar la lógica de > 24h.
 */
export async function registrarSalida(
  id_ingreso: number, 
  cerrado_por: string,
  fecha_egreso: Date,
  motivo_cierre_tardio?: string
): Promise<Ingreso | null> {
  const queryText = `
    UPDATE ingreso_por_dia
    SET 
      fecha_egreso = $2,
      cerrado_por = $3,
      motivo_cierre_fuera_de_termino = $4,
      cerrado_en = NOW() -- Fecha real de la operación del sistema
    WHERE id_ingreso = $1 AND fecha_egreso IS NULL
    RETURNING *;
  `;

  const result = await query(queryText, [
    id_ingreso, 
    fecha_egreso, 
    cerrado_por, 
    motivo_cierre_tardio ?? null
  ]);

  return (result.rows[0] ?? null) as Ingreso | null;
}


export async function insertarIngreso(data: {
  documento: string;
  nro_tarjeta: string;
  lugar_visita: string;
  motivo: string;
  observacion?: string;
  identificador_solicitante: string;
  abierto_por: string; // Nuevo campo obligatorio
}) {
  const queryText = `
    INSERT INTO ingreso_por_dia (
      documento, 
      nro_tarjeta, 
      fecha_ingreso, 
      lugar_visita, 
      motivo, 
      observacion, 
      identificador_solicitante,
      abierto_por,
      abierto_en
    ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, NOW())
  `;

  return query(queryText, [
    data.documento,
    data.nro_tarjeta,
    data.lugar_visita,
    data.motivo,
    data.observacion ?? null,
    data.identificador_solicitante,
    data.abierto_por
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