'use server';

import { revalidatePath } from 'next/cache';
import { insertarDisenoPat, type DisenoPatInsert } from '@/lib/database/diseno-pat-queries';
import { DatabaseError } from 'pg';
import { error } from 'console';

// ⚠️ Este tipo es exactamente el payload que arma el form en el cliente.
//     Lo separamos del insert por si luego queremos agregar campos server-side.
export type NuevoDisenoPatInput = DisenoPatInsert;

export async function crearDisenoPat(input: NuevoDisenoPatInput) {
  try {
    const { id } = await insertarDisenoPat(input);

    // Revalidamos la lista de diseños (ajustá el path si tu ruta pública difiere)
    revalidatePath('/(protected)/(Pases)/pat/disenos');

    return { ok: true as const, id };
  } catch (error: unknown) {
    // Mapeo de errores de Postgres (si aplica)
    const db = error as Partial<DatabaseError>;
    if (db && typeof db.code === 'string') {
      // Ejemplo: único duplicado, check constraints, etc.
      switch (db.code) {
        case '23505': // unique_violation
          return { ok: false as const, error: 'Ya existe un diseño con esos datos únicos.' };
        case '23514': // check_violation
          return { ok: false as const, error: 'Violación de regla de la tabla de diseños.' };
      }
    }

    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return { ok: false as const, error: `No se pudo crear el diseño: ${msg}` };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function publicarDisenoPatAction(id:number){
  //TODO: implementar logica, ahora solo tira error
  throw error;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function archivarDisenoPatAction(id:number){
  //TODO: implementar logica, ahora solo tira error.
  throw error;
}