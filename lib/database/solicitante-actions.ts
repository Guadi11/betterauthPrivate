// lib/actions/solicitante-actions.ts
'use server'

import { revalidatePath } from "next/cache";
import { 
    obtenerSolicitanteConId,
    Solicitante,
    insertarSolicitante, 
    actualizarSolicitante, 
    eliminarSolicitante,
} from "./solicitante-queries";
// Reutilizamos el schema existente, muy buena práctica
import { solicitanteSchema } from "@/lib/zod/ingreso-schemas";
import { z } from "zod";
import { DatabaseError } from "pg";

export async function verificarSolicitante(identificador:string): Promise<Solicitante | null>{
    const solicitante = await obtenerSolicitanteConId(identificador);
    return solicitante ?? null;
} 

export async function guardarSolicitanteAction(data: z.infer<typeof solicitanteSchema>, esEdicion: boolean) {
  // 1. Validación de Zod
  const result = solicitanteSchema.safeParse(data);

  if (!result.success) {
    // Podrías aplanar los errores como en tu registro-actions si quisieras detalle por campo
    return { success: false, error: "Datos inválidos en el formulario." };
  }

  try {
    if (esEdicion) {
      // Update
      await actualizarSolicitante(result.data);
    } else {
      // Create
      // Nota: Ya no necesitamos consultar 'obtenerSolicitanteConId' manualmente antes,
      // podemos dejar que la DB tire el error de restricción única (atomicidad)
      await insertarSolicitante(result.data);
    }
    
    revalidatePath("/dashboard/solicitantes");
    return { success: true };

  } catch (error: unknown) {
    console.error("Error en guardarSolicitanteAction:", error);
    
    const dbError = error as DatabaseError;

    // Código 23505: Unique constraint violation (Llave duplicada)
    if (dbError.code === '23505') {
      // Postgres suele devolver el detalle en dbError.detail, ej: "Key (identificador)=(123) already exists."
      return { 
        success: false, 
        error: "Ya existe un solicitante con este Identificador (DNI/MR)." 
      };
    }

    // Código 22001: String data right truncation (Texto muy largo)
    if (dbError.code === '22001') {
      return { 
        success: false, 
        error: "Uno de los campos excede la longitud máxima permitida." 
      };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Ocurrió un error inesperado al guardar." };
  }
}

export async function eliminarSolicitanteAction(identificador: string) {
  try {
    await eliminarSolicitante(identificador);
    revalidatePath("/dashboard/solicitantes");
    return { success: true };

  } catch (error: unknown) {
    console.error("Error en eliminarSolicitanteAction:", error);

    const dbError = error as DatabaseError;

    // Código 23503: Foreign key violation (Integridad referencial)
    if (dbError.code === '23503') {
      // Esto captura exactamente el error que me mostraste en el log anterior
      return { 
        success: false, 
        error: "No se puede eliminar: El solicitante tiene ingresos o pases históricos asociados." 
      };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Ocurrió un error inesperado al eliminar." };
  }
}