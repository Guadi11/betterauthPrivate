// app/actions/registro-actions.ts
'use server'

import { Registro, insertarRegistro } from '@/lib/database/registros-queries';
import { RegistroSchema } from '@/components/registros/crear-registro-form'; 
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function crearRegistro(data: z.infer<typeof RegistroSchema>) {
  try {
    // Convertir los datos del formulario para adaptarse a la función insertarRegistro
    const registro: Registro = {
      documento: data.documento,
      tipo_documento: data.tipo_documento,
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nacimiento: data.fecha_nacimiento,
      nacionalidad: data.nacionalidad || undefined,
      domicilio_real: data.domicilio_real || undefined,
      domicilio_eventual: data.domicilio_eventual || undefined,
      referido_cc: data.referido_cc
    };
    
    // Insertar en la base de datos
    const nuevoRegistro = await insertarRegistro(registro);
    
    // Opcional: revalidar la ruta para actualizar datos en componentes
    revalidatePath('/ruta-donde-muestras-registros');
    
    return { success: true, registro: nuevoRegistro };
  } catch (error) {
    console.error("Error al crear registro:", error);
    return { success: false, error: String(error) };
  }
}