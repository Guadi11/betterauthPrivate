import { query } from '@/lib/database/db';

export interface Solicitante {
  identificador: string;
  tipo_identificador: 'MR' | 'DNI';
  jerarquia: string;
  destino: string;
  telefono: string;
  nombre: string;
}

export async function obtenerSolicitanteConId(id: string): Promise<Solicitante | null> {
  const queryText = `
    SELECT *
    FROM solicitante
    WHERE identificador = $1
  `;

  try {
    const result = await query(queryText, [id]);
    return result.rows[0] ?? null;
  } catch (error) {
    console.error('Error al obtener solicitante:', error);
    throw error;
  }
}

export async function insertarSolicitante(data: Solicitante) {
    const queryText = `
      INSERT INTO solicitante (
        identificador,
        tipo_identificador,
        jerarquia,
        destino,
        telefono,
        nombre
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
  
    try {
      await query(queryText, [
        data.identificador,
        data.tipo_identificador,
        data.jerarquia,
        data.destino,
        data.telefono,
        data.nombre,
      ]);
    } catch (error) {
      console.error('Error al insertar solicitante:', error);
      throw error;
    }
  }

  // 1. Listar con búsqueda (Search)
export async function obtenerSolicitantes(busqueda: string = ""): Promise<Solicitante[]> {
  // Usamos ILIKE para búsqueda case-insensitive en nombre o identificador
  const queryText = `
    SELECT *
    FROM solicitante
    WHERE 
      nombre ILIKE $1 OR 
      identificador ILIKE $1
    ORDER BY nombre ASC
    LIMIT 50
  `;
  // El % es el comodín de SQL
  const values = [`%${busqueda}%`];

  try {
    const result = await query(queryText, values);
    return result.rows;
  } catch (error) {
    console.error('Error al listar solicitantes:', error);
    throw new Error('Error de base de datos al listar solicitantes');
  }
}

// 2. Modificar (Update)
export async function actualizarSolicitante(data: Solicitante): Promise<void> {
  const queryText = `
    UPDATE solicitante
    SET 
      tipo_identificador = $2,
      jerarquia = $3,
      destino = $4,
      telefono = $5,
      nombre = $6
    WHERE identificador = $1
  `;

  try {
    await query(queryText, [
      data.identificador, // $1 (PK inmutable en el WHERE)
      data.tipo_identificador,
      data.jerarquia,
      data.destino,
      data.telefono,
      data.nombre
    ]);
  } catch (error) {
    console.error('Error al actualizar solicitante:', error);
    throw error;
  }
}

// 3. Eliminar (Delete)
export async function eliminarSolicitante(identificador: string): Promise<void> {
  const queryText = `DELETE FROM solicitante WHERE identificador = $1`;
  
  try {
    await query(queryText, [identificador]);
  } catch (error) {
    // Es probable que falle si el solicitante tiene ingresos asociados (FK constraint)
    console.error('Error al eliminar solicitante:', error);
    throw new Error('No se puede eliminar: El solicitante tiene registros asociados.');
  }
}