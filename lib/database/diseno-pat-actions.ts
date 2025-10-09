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

// Helper seguro sin any
function pickUserId(sessionData: unknown): string {
  if (typeof sessionData !== 'object' || sessionData === null) return 'usuarioPruebaPases';
  const rec = sessionData as Record<string, unknown>;
  const user = rec.user as unknown;
  if (typeof user !== 'object' || user === null) return 'usuarioPruebaPases';
  const u = user as Record<string, unknown>;
  const id = typeof u.id === 'string' && u.id.length > 0 ? u.id : null;
  const username = typeof u.username === 'string' && u.username.length > 0 ? u.username : null;
  return id ?? username ?? 'usuarioPruebaPases';
}

// Payload que espera la acción de creación
export type NuevoDisenoPatInput = Omit<DisenoPatInsertInput, 'creado_por'> & { creado_por?: string };

export async function crearDisenoPat(input: NuevoDisenoPatInput & { session?: unknown }) {
  try {
    const payload: DisenoPatInsertInput = {
      nombre: input.nombre,
      ancho_mm: input.ancho_mm,
      alto_mm: input.alto_mm,
      dpi_previsualizacion: input.dpi_previsualizacion,
      lienzo_json: input.lienzo_json,
      estado: input.estado,
      // si no vino, lo tomamos de la sesión
      creado_por: input.creado_por ?? pickUserId(input.session),
    };

    const { id } = await insertarDisenoPat(payload);

    revalidatePath('/(protected)/(Pases)/pat/disenos');
    return { ok: true as const, id };
  } catch (error: unknown) {
    const db = error as Partial<DatabaseError>;
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
  await actualizarDisenoPat(input);
  return { ok: true as const };
}

// (Opcional) acciones rápidas para estado, ya que tenemos la query
export async function setEstadoDisenoPat(id: string, estado: EstadoDiseno) {
  await actualizarEstadoDisenoPat(id, estado);
  revalidatePath('/(protected)/(Pases)/pat/disenos');
  return { ok: true as const };
}
