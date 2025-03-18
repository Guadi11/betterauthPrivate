import { query } from '@/lib/database/db';

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
  referido_cc?: boolean;
}

// Obtener todos los registros
export async function getAllRegistros(): Promise<Registro[]> {
  const queryText = 'SELECT * FROM registro ORDER BY apellido, nombre';
  
  const result = await query(queryText);
  return result.rows;
}

// Buscar registro por documento
export async function getRegistroByDocumento(documento: string): Promise<Registro | null> {
  const queryText = 'SELECT * FROM registro WHERE documento = $1';
  
  const result = await query(queryText, [documento]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Buscar registros por nombre o apellido (parcial)
export async function searchRegistros(searchTerm: string): Promise<Registro[]> {
  const queryText = `
    SELECT * FROM registro 
    WHERE 
      LOWER(nombre) LIKE LOWER($1) OR 
      LOWER(apellido) LIKE LOWER($1)
    ORDER BY apellido, nombre
  `;
  
  const result = await query(queryText, [`%${searchTerm}%`]);
  return result.rows;
}

// Insertar un nuevo registro
export async function createRegistro(registro: Omit<Registro, 'referido_cc'> & { referido_cc?: boolean }): Promise<Registro> {
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
      referido_cc
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
    registro.referido_cc || false
  ];
  
  const result = await query(queryText, values);
  return result.rows[0];
}

// Actualizar un registro existente
export async function updateRegistro(documento: string, registro: Partial<Registro>): Promise<Registro | null> {
  const updateFields = Object.keys(registro)
    .filter(key => registro[key] !== undefined)
    .map((key, index) => `${key} = $${index + 2}`);
  
  if (updateFields.length === 0) {
    return null;
  }
  
  const queryText = `
    UPDATE registro 
    SET ${updateFields.join(', ')}
    WHERE documento = $1
    RETURNING *
  `;
  
  const values = [
    documento,
    ...Object.values(registro).filter(value => value !== undefined)
  ];
  
  const result = await query(queryText, values);
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Eliminar un registro
export async function deleteRegistro(documento: string): Promise<boolean> {
  const queryText = 'DELETE FROM registro WHERE documento = $1';
  
  const result = await query(queryText, [documento]);
  return result.rowCount > 0;
}