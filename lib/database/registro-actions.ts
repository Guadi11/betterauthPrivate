// app/actions/registro-actions.ts
'use server'

import { Registro, RegistroInsert, RegistroUpdate, actualizarObservacionRegistroEnDB, actualizarRegistroEnDB, insertarRegistro } from '@/lib/database/registros-queries';
import { RegistroSchema, RegistroFormData } from '@/lib/zod/registro-schemas'; 
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { DatabaseError } from 'pg';
import { requireUserId } from "@/lib/auth/session";

type ActionErrorFields = Partial<Record<keyof RegistroFormData, string>>;
type CrearRegistroResult =
  | { success: true; registro: Registro }
  | { success: false; fieldErrors?: ActionErrorFields; message?: string; code?: string };

export async function crearRegistro(raw: unknown): Promise<CrearRegistroResult> {
  // Validación en servidor
  const parsed = RegistroSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ActionErrorFields = {};
    const flat = parsed.error.flatten().fieldErrors;
    for (const k in flat) {
      const key = k as keyof RegistroFormData;
      const msg = flat[key]?.[0];
      if (msg) fieldErrors[key] = msg;
    }
    return { success: false, fieldErrors };
  }

  const data = parsed.data;

  try {
    // 1) Obtenemos el ID del usuario autenticado
    const userId = await requireUserId();
    console.log(userId);
    const registro: RegistroInsert = {
      documento: data.documento,
      tipo_documento: data.tipo_documento,
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nacimiento: data.fecha_nacimiento,
      nacionalidad: data.nacionalidad || undefined,
      domicilio_real: data.domicilio_real || undefined,
      domicilio_eventual: data.domicilio_eventual || undefined,
      observacion_cc: data.observacion_cc,
      creado_por: userId,
      actualizado_por: userId,
    };

    const nuevoRegistro = await insertarRegistro(registro);
    revalidatePath('/buscar_registro');
    return { success: true, registro: nuevoRegistro };
  } catch (error: unknown) {
    const dbError = error as DatabaseError;

    // Duplicado
    if (dbError.code === '23505') {
      return { success: false, fieldErrors: { documento: 'Ya existe un registro con ese documento.' }, code: dbError.code };
    }

    // Violación de CHECK (como check_documento en tu trace)
    if (dbError.code === '23514') {
      if (dbError.constraint === 'check_documento') {
        return {
          success: false,
          fieldErrors: { documento: 'El documento no cumple el formato para el tipo seleccionado.' },
          code: dbError.code,
        };
      }
      return { success: false, message: 'Algún dato no cumple las reglas de la base de datos.', code: dbError.code };
    }

    // Texto demasiado largo para VARCHAR(n)
    if (dbError.code === '22001') {
      return { success: false, message: 'Uno de los campos supera el largo máximo permitido.', code: dbError.code };
    }

    // Formato inválido (p.ej., fecha)
    if (dbError.code === '22P02') {
      return { success: false, fieldErrors: { fecha_nacimiento: 'Fecha inválida.' }, code: dbError.code };
    }

    // NOT NULL
    if (dbError.code === '23502') {
      return { success: false, message: 'Faltan campos obligatorios.', code: dbError.code };
    }

    return { success: false, message: 'Error inesperado al crear el registro.', code: dbError.code };
  }
}

export async function actualizarRegistro(data: z.infer<typeof RegistroSchema>, documentoViejo: string) {
  try{
    const userId = await requireUserId();
    const registro: RegistroUpdate = {
      documento: data.documento,
      tipo_documento: data.tipo_documento,
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nacimiento: data.fecha_nacimiento,
      nacionalidad: data.nacionalidad || undefined,
      domicilio_real: data.domicilio_real || undefined,
      domicilio_eventual: data.domicilio_eventual || undefined,
      observacion_cc: data.observacion_cc,
      actualizado_por: userId,
    }

    await actualizarRegistroEnDB(registro, documentoViejo)
    revalidatePath(`/registro/${registro.documento}`)

    return { success: true }
  } catch (error: unknown) {
    const dbError = error as DatabaseError;
    
    if (dbError.code === '23503' && dbError.constraint === 'fk_documento') {
      return {
        success: false,
        error: 'No se puede cambiar el documento porque existen ingresos asociados a este registro.'
      };
    }

    if (dbError.code === '23505') {
      return {
        success: false,
        error: 'Ya existe un registro con ese documento.'
      };
    }

    return { success: false, error: 'Error inesperado al actualizar el registro.' };
  }
}

export async function actualizarObservacionRegistro(documento:string, observacion:string){
  try{
    const userId = await requireUserId();
    await actualizarObservacionRegistroEnDB(documento, observacion, userId);
    return {
      success:true
    };
  }catch(error){
    return{ success: false, error: 'Error inesperado al actualizar el registro.'+error }
  }

}