import { z } from "zod";

export const MIME_PERMITIDOS = ["image/png", "image/jpeg"] as const;

export const RecursoFiltroSchema = z.object({
    search: z.string().trim().optional(),
    mime: z.enum(MIME_PERMITIDOS).optional(),
    estado: z.enum(["activo", "archivado"]).optional(),
    limit: z.number().int().positive().max(100).default(24),
    offset: z.number().int().nonnegative().default(0),
});

export type RecursoFiltro = z.infer<typeof RecursoFiltroSchema>;

export const SubidaRecursoSchema = z.object({
    nombre: z.string().min(1).max(255),
    mime_type: z.enum(MIME_PERMITIDOS),
    bytes_size: z.number().int().positive(),
    ancho_px: z.number().int().positive(),
    alto_px: z.number().int().positive(),
    sha256: z.string().length(64),
});

export type SubidaRecursoInput = z.infer<typeof SubidaRecursoSchema>;