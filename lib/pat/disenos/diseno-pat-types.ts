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
  creado_por: string;          // user.id (texto)
  actualizado_por?: string | null; // si más adelante lo agregamos
}

// Fila completa de BD
export type DisenoPatRow = DisenoPatCore & WithId & WithTimestamps & WithAudit;

// Payloads
export type DisenoPatInsertInput = DisenoPatCore & Pick<WithAudit, 'creado_por'>;
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
}
