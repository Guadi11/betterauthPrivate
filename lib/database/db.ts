import { Pool, PoolClient } from "pg";


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