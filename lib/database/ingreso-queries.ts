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

export interface EstadisticasIngreso {
  ingresos_hoy: number;
  ingresos_ayer: number;
  ingresos_totales: number;
  ingresos_zr_hoy: number;
}

export interface FiltrosIngreso {
  query?: string;        // Búsqueda de texto (nombre, dni, tarjeta)
  estado?: 'todos' | 'abiertos'; // Filtro de estado
  page?: number;         // Página actual (empieza en 1)
  limit?: number;        // Cantidad por página
}

export interface RespuestaPaginada<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function obtenerIngresosFiltrados(filtros: FiltrosIngreso): Promise<RespuestaPaginada<IngresoCompleto>> {
  noStore();
  
  const { query: busqueda, estado, page = 1, limit = 10 } = filtros;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  // CORRECCIÓN: Tipado estricto para los parámetros de pg
  // Postgres acepta string, number, boolean, null o Date.
  const params: (string | number | boolean | Date | null)[] = [];
  
  let sql = `
    SELECT 
      *,
      COUNT(*) OVER() as total_count
    FROM vista_ingresos_completa
  `;

  // --- FILTROS ---
  if (busqueda) {
    params.push(`%${busqueda}%`);
    const paramIndex = params.length;
    conditions.push(`(
      nombre ILIKE $${paramIndex} OR 
      apellido ILIKE $${paramIndex} OR 
      documento ILIKE $${paramIndex} OR 
      nro_tarjeta ILIKE $${paramIndex} OR
      nombre_solicitante ILIKE $${paramIndex} OR
      lugar_visita ILIKE $${paramIndex}
    )`);
  }

  if (estado === 'abiertos') {
    conditions.push(`fecha_egreso IS NULL`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // --- PAGINACIÓN ---
  sql += ` ORDER BY fecha_ingreso DESC`;
  
  params.push(limit);
  sql += ` LIMIT $${params.length}`;
  
  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  try {
    const result = await query(sql, params);
    
    // CORRECCIÓN: Parseo seguro del count (que viene como string en pg)
    const firstRow = result.rows[0];
    const totalCount = firstRow ? Number(firstRow.total_count) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    // CORRECCIÓN: Eliminación limpia de la propiedad auxiliar
    // Usamos { total_count: _, ...rest } para decirle a TS "ignora esta variable"
    const data = result.rows.map((row) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { total_count: _, ...rest } = row; 
      return rest as IngresoCompleto;
    });

    return {
      data,
      metadata: {
        total: totalCount,
        page,
        totalPages,
        hasMore: page < totalPages
      }
    };

  } catch (error) {
    console.error('Error filtrando ingresos:', error);
    return { 
      data: [], 
      metadata: { total: 0, page: 1, totalPages: 0, hasMore: false } 
    };
  }
}

// --- NUEVA FUNCIÓN PARA EL DASHBOARD ---
export async function obtenerEstadisticasDashboard(): Promise<EstadisticasIngreso> {
  noStore(); // Evita que Next.js cachee estos números estáticamente

  // Usamos FILTER de Postgres para contar condicionalmente en una sola consulta
  // Asumimos que 'ZR' se busca en 'lugar_visita'. Si es en otro campo, cambialo abajo.
  // Otra opcion para buscar 'ZR' podria ser en la tarjeta
  const queryText = `
    SELECT
      COUNT(*) FILTER (WHERE fecha_ingreso::date = CURRENT_DATE) as ingresos_hoy,
      COUNT(*) FILTER (WHERE fecha_ingreso::date = CURRENT_DATE - 1) as ingresos_ayer,
      COUNT(*) as ingresos_totales,
      COUNT(*) FILTER (WHERE fecha_ingreso::date = CURRENT_DATE AND lugar_visita ILIKE '%ZR%') as ingresos_zr_hoy
    FROM ingreso_por_dia
  `;

  try {
    const result = await query(queryText);
    const row = result.rows[0];

    // Postgres devuelve los counts como strings (bigint), los parseamos a number
    return {
      ingresos_hoy: Number(row.ingresos_hoy || 0),
      ingresos_ayer: Number(row.ingresos_ayer || 0),
      ingresos_totales: Number(row.ingresos_totales || 0),
      ingresos_zr_hoy: Number(row.ingresos_zr_hoy || 0),
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    // Retornamos ceros para no romper la UI si falla la DB
    return {
      ingresos_hoy: 0,
      ingresos_ayer: 0,
      ingresos_totales: 0,
      ingresos_zr_hoy: 0
    };
  }
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