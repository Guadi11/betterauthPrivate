// lib/pat/disenos/diseno-pat-schemas.ts
import { z } from 'zod';

export const estadoDisenoEnum = z.enum(['borrador', 'publicado', 'archivado']);

export const disenoPatCoreSchema = z.object({
  nombre: z.string().trim().min(3).max(100),
  ancho_mm: z.number().positive(),
  alto_mm: z.number().positive(),
  dpi_previsualizacion: z.number().int().min(72).max(1200),
  lienzo_json: z.unknown(), // JSON de Konva serializado como objeto
  estado: estadoDisenoEnum,
});

export const disenoPatInsertSchema = disenoPatCoreSchema.extend({
  creado_por: z.string().min(1),
});

export const disenoPatUpdateSchema = z
  .object({ id: z.string().min(1) })
  .and(disenoPatCoreSchema.partial());
