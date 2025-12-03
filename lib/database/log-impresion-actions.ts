'use server'

import { z } from 'zod';
import { query, isDatabaseError } from "@/lib/database/db";
import { requireUserId } from "@/lib/auth/session";

// Esquema de validación
const LogImpresionSchema = z.object({
  pat_id: z.number(),
  diseno_id: z.string(), // Viene como string del frontend, postgres lo convertirá a bigint
  variables_resueltas: z.record(z.string()), // JSON plano clave-valor
});

export type LogImpresionResult = 
  | { ok: true } 
  | { ok: false; error: string };

export async function logPrintAttempt(rawInput: z.infer<typeof LogImpresionSchema>): Promise<LogImpresionResult> {
  
  // 1. Autenticación (Igual que en darIngreso)
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (e) {
    console.error("Intento de impresión sin sesión:", e);
    return { ok: false, error: "No se pudo verificar la sesión del usuario." };
  }

  // 2. Validación Zod
  const validation = LogImpresionSchema.safeParse(rawInput);
  if (!validation.success) {
    return { ok: false, error: "Datos de impresión inválidos." };
  }

  const { pat_id, diseno_id, variables_resueltas } = validation.data;
  const copias = 1; // Default

  // 3. Insertar en BDD
  const sql = `
    INSERT INTO log_impresion_pat 
      (pat_id, diseno_id, impreso_por, impreso_en, copias, variables_resueltas)
    VALUES 
      ($1, $2, $3, NOW(), $4, $5::jsonb)
  `;

  try {
    await query(sql, [
      pat_id,
      diseno_id,
      userId, // Usamos el ID de la sesión segura
      copias,
      JSON.stringify(variables_resueltas),
    ]);

    return { ok: true };

  } catch (err: unknown) {
    console.error("Error al auditar impresión:", err);
    // Manejo de error genérico o específico si hiciera falta
    if (isDatabaseError(err)) {
        return { ok: false, error: "Error de base de datos al registrar auditoría." };
    }
    return { ok: false, error: "Error desconocido al registrar la impresión." };
  }
}