// lib/pat/disenos/diseno-pat-types.ts

export type EstadoDiseno = 'borrador' | 'publicado' | 'archivado';

// Alias semántico: mantenemos unknown para no acoplar al tipo exacto de Konva
export type KonvaSerialized = unknown;

export interface DisenoPatCore {
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  lienzo_json: KonvaSerialized;
  estado: EstadoDiseno;
}

export interface WithId {
  id: string; // bigint en BD -> string en TS
}

export interface WithTimestamps {
  creado_en: string;       // ISO (timestamptz)
  actualizado_en: string;  // ISO (timestamptz)
}

export interface WithAudit {
  creado_por: string;            // user.id (texto)
  // Actualizamos el tipo: en BD es nullable, y ya lo estamos usando.
  actualizado_por: string | null; 
}

// Fila completa de BD (Select * from diseno_pat)
export type DisenoPatRow = DisenoPatCore & WithId & WithTimestamps & WithAudit;

// Inputs -------------------------------------------------------------

// Input de creación: Necesitamos 'creado_por' en el payload interno de la query,
// aunque la Action lo inyecte desde la sesión.
export type DisenoPatInsertInput = DisenoPatCore & Pick<WithAudit, 'creado_por'>;

// Input de actualización:
// NOTA DIDÁCTICA: Mantenemos este tipo SIN 'actualizado_por'.
// ¿Por qué? Porque este tipo representa lo que 'puede' venir del formulario/cliente.
// El 'actualizado_por' se inyecta en el servidor (Action) y se pasa como argumento
// separado a la query. Esto evita que alguien envíe un payload falsificando el usuario.
export type DisenoPatUpdateInput = WithId & Partial<DisenoPatCore>;

// Item para la tabla (listado)
export interface DisenoPatListItem {
  id: string;
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  estado: EstadoDiseno;
  actualizado_en: string;
  // Opcional: Si en el futuro quieres mostrar en la tabla quién editó último,
  // agregarías aquí: actualizado_por?: string | null;
}
