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
