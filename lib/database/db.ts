//lib/database/db.ts
import { DatabaseError, Pool, PoolClient } from "pg";

export const pool = new Pool({
    user: 'postgres',
    password: 'admin',
    host: 'localhost',
    port: 5433,
    database: 'betterauth',
})

export async function query(text: string, params?: unknown[]){
    const client = await pool.connect();
    try{
        return await client.query(text,params);
    }catch (error) {
        console.error("Error en la consulta SQL:", { text, params, error });
        throw error; // se relanza para que el script que la usa lo maneje
    }finally{
        client.release();
    }
}

// Función para obtener un cliente del pool para transacciones
export async function getClient(): Promise<PoolClient> {
    return await pool.connect();
  }
  
  // Función para cerrar la conexión (útil para pruebas o shutdown)
  export async function closePool() {
    await pool.end();
  }

//Fucnion para utilizar en <tabla>-actions.ts para detectar error de db
export function isDatabaseError(e: unknown): e is DatabaseError {
  return typeof e === 'object' && e !== null && 'code' in e;
}