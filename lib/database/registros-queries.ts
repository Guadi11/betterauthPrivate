import { query } from '@/lib/database/db';
import { unstable_noStore as noStore } from 'next/cache';

// Interfaz para el tipo de Registro
export interface Registro {
  documento: string;
  tipo_documento: 'DNI' | 'Pasaporte';
  nombre: string;
  apellido: string;
  fecha_nacimiento?: Date;
  nacionalidad?: string;
  domicilio_real?: string;
  domicilio_eventual?: string;
  observacion_cc?: boolean;
}

/**
 * Obtiene todos los registros de la base de datos
 */
export async function obtenerTodosLosRegistros(): Promise<Registro[]> {
  const queryText = 'SELECT * FROM registro ORDER BY apellido, nombre';
  
  const result = await query(queryText);
  return result.rows;
}

export async function getTotalRegistros(): Promise<number> {
  const result = await query("SELECT COUNT(*) FROM registro");
  return parseInt(result.rows[0].count, 10);
}
/**
 * Obtiene registros filtrados con paginación
 * @consulta texto con el cual se busca en la bdd
 * @currentPage pagina actual
 */
const ITEMS_POR_PAGINA = 6;
export async function obtenerRegistrosFiltradosPaginado(
  consulta: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_POR_PAGINA;
  
  try {
    const queryText = `
      SELECT * FROM registro
      WHERE
        LOWER(nombre) LIKE LOWER($1) OR
        LOWER(apellido) LIKE LOWER($1) OR
        documento = $2
      ORDER BY apellido, nombre
      LIMIT ${ITEMS_POR_PAGINA} OFFSET ${offset}
    `;
    
    const registros = await query(queryText, [`%${consulta}%`, consulta]);
    return registros.rows;
  } catch (error) {
    console.error('Error en la Base de Datos:', error);
    throw new Error('Error al buscar registros.');
  }
}

export async function obtenerPaginasRegistrosFiltrados(consulta: string){
  noStore();
  try{
    const queryText =`
      SELECT COUNT(*)
      FROM registro
      WHERE
        LOWER(nombre) LIKE LOWER($1) OR
        LOWER(apellido) LIKE LOWER($1) OR
        documento = $2
    `;

    const count = await query(queryText, [`%${consulta}%`, consulta]);
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_POR_PAGINA);
    return totalPages;
  } catch(error){
    console.error('Database Error: ', error);
    throw new Error('error al obtener el total de paginas de registros');
  }
}

/**
 * Obtiene registros con paginación
 * @param page Número de página (comienza en 1)
 * @param limit Límite de registros por página
 */
export async function obtenerTodosLosRegistrosPaginado(page: number = 1, pageSize: number = 10): Promise<{
    registros: Registro[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;
    
    // Consulta para obtener los registros paginados
    const queryText = `
      SELECT * FROM registro 
      ORDER BY apellido, nombre
      LIMIT $1 OFFSET $2
    `;
    
    // Consulta para obtener el total de registros
    const countQuery = 'SELECT COUNT(*) FROM registro';
    
    // Ejecutar ambas consultas
    const [registrosResult, countResult] = await Promise.all([
      query(queryText, [pageSize, offset]),
      query(countQuery)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    
    return {
      registros: registrosResult.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

// Buscar registro por documento
export async function obtenerRegistroPorDocumento(documento: string): Promise<Registro | null> {
  const queryText = 'SELECT * FROM registro WHERE documento = $1';
  
  const result = await query(queryText, [documento]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Busca registros por nombre, apellido o documento
 * @param texto Texto a buscar en nombre, apellido o documento
 */
export async function buscarRegistrosPorNombreApellidoDocumento(texto: string): Promise<Registro[]> {
  const queryText = `
    SELECT * FROM registro 
    WHERE 
      LOWER(nombre) LIKE LOWER($1) OR 
      LOWER(apellido) LIKE LOWER($1) OR 
      documento = $1 
    ORDER BY apellido, nombre
  `;
  const result = await query(queryText, [`%${texto}%`]);
  
  return result.rows;
}

// Insertar un nuevo registro
export async function insertarRegistro(registro: Omit<Registro, 'observacion_cc'> & { observacion_cc?: boolean }): Promise<Registro> {
  const queryText = `
    INSERT INTO registro (
      documento, 
      tipo_documento, 
      nombre, 
      apellido, 
      fecha_nacimiento, 
      nacionalidad, 
      domicilio_real, 
      domicilio_eventual, 
      observacion_cc
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const values = [
    registro.documento,
    registro.tipo_documento,
    registro.nombre,
    registro.apellido,
    registro.fecha_nacimiento || null,
    registro.nacionalidad || null,
    registro.domicilio_real || null,
    registro.domicilio_eventual || null,
    registro.observacion_cc ?? false
  ];
  
  try{
    const result = await query(queryText, values);
    return result.rows[0];
  } catch (error){
    throw error;
  }
}

export async function actualizarRegistroEnDB(registro: Registro) {
  await query(
    `UPDATE registro SET
      tipo_documento = $1,
      nombre = $2,
      apellido = $3,
      fecha_nacimiento = $4,
      nacionalidad = $5,
      domicilio_real = $6,
      domicilio_eventual = $7,
      observacion_cc = $8
     WHERE documento = $9`,
    [
      registro.tipo_documento,
      registro.nombre,
      registro.apellido,
      registro.fecha_nacimiento ?? null,
      registro.nacionalidad ?? null,
      registro.domicilio_real ?? null,
      registro.domicilio_eventual ?? null,
      registro.observacion_cc,
      registro.documento,
    ]
  )
}