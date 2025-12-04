// lib/database/diseno-pat-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import type {
  DisenoPatInsertInput,
  DisenoPatUpdateInput,
  EstadoDiseno,
} from '@/lib/pat/disenos/diseno-pat-types';
import {
  insertarDisenoPat,
  actualizarDisenoPat,
  actualizarEstadoDisenoPat,
} from '@/lib/database/diseno-pat-queries';
import { DatabaseError } from 'pg';
import { requireUserId } from "@/lib/auth/session"; // Importamos la auth real

// Eliminamos pickUserId y NuevoDisenoPatInput complejo ya que el usuario se infiere de la sesión
export type NuevoDisenoPatInput = Omit<DisenoPatInsertInput, 'creado_por'>;

export async function crearDisenoPat(input: NuevoDisenoPatInput) {
  try {
    // 1. Verificación de Seguridad: Obtenemos ID de sesión segura
    const userId = await requireUserId();

    // 2. Construcción del payload
    const payload: DisenoPatInsertInput = {
      nombre: input.nombre,
      ancho_mm: input.ancho_mm,
      alto_mm: input.alto_mm,
      dpi_previsualizacion: input.dpi_previsualizacion,
      lienzo_json: input.lienzo_json,
      estado: input.estado,
      creado_por: userId, // Usamos el ID verificado
    };

    // 3. Inserción en DB
    const { id } = await insertarDisenoPat(payload);

    revalidatePath('/(protected)/(Pases)/pat/disenos');
    return { ok: true as const, id };

  } catch (error: unknown) {
    // Manejo de errores consistente
    const db = error as Partial<DatabaseError>;
    
    // Si el error viene de requireUserId (no autenticado)
    if (error instanceof Error && error.message.includes('session')) { 
        return { ok: false as const, error: 'Usuario no autenticado.' };
    }

    if (db && typeof db.code === 'string') {
      switch (db.code) {
        case '23505':
          return { ok: false as const, error: 'Ya existe un diseño con esos datos únicos.' };
        case '23514':
          return { ok: false as const, error: 'Violación de regla de la tabla de diseños.' };
      }
    }
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return { ok: false as const, error: `No se pudo crear el diseño: ${msg}` };
  }
}

export type GuardarDisenoPatInput = DisenoPatUpdateInput;

export async function guardarDisenoPat(input: GuardarDisenoPatInput) {
  try {
    // 1. Auth check
    const userId = await requireUserId();

    // 2. Update DB pasando el usuario
    await actualizarDisenoPat(input, userId);
    
    revalidatePath('/(protected)/(Pases)/pat/disenos');
    return { ok: true as const };

  } catch (error) {
    console.error("Error al guardar diseño:", error);
    return { ok: false as const, error: 'Error al actualizar el diseño' };
  }
}

// Acciones rápidas para estado
export async function setEstadoDisenoPat(id: string, estado: EstadoDiseno) {
  try {
    const userId = await requireUserId();
    
    // Pasamos userId para registrar quién cambió el estado
    await actualizarEstadoDisenoPat(id, estado, userId);
    
    revalidatePath('/(protected)/(Pases)/pat/disenos');
    return { ok: true as const };
  } catch (error) {
     console.error("Error al cambiar estado:", error);
     return { ok: false as const, error: 'No se pudo cambiar el estado' };
  }
}