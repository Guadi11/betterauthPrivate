// lib/database/diseno-pat-actions.ts
"use server";

import { z } from "zod";
import {
  insertarDisenoPat,
  actualizarDisenoPat,
  publicarDiseno,
  archivarDiseno,
  insertarRecursoDisenoPat,
  registrarLogImpresion,
  type EstadoDiseno,
} from "@/lib/database/diseno-pat-queries";
import { assertRolPersonalPases } from "@/lib/server-action-helpers";
import { JsonValue } from "@/types/json";

// ---------- Zod: esquema de lienzo_json ----------
const VarKeyEnum = z.enum([
  "NRO_INTERNO",
  "TIPO_ZONA",
  "ACCESO_PAT",
  "APELLIDO_NOMBRE",
  "DOCUMENTO",
  "FECHA_VENCIMIENTO",
  "CAUSA_MOTIVO",
  "CODIGO_SEGURIDAD",
]);

const BaseNode = z.object({
  id: z.string().min(1),
  x_mm: z.number().min(0),
  y_mm: z.number().min(0),
  rotation: z.number().optional(),
  zIndex: z.number().int().optional(),
});

const VarTextNode = BaseNode.extend({
  type: z.literal("var_text"),
  varKey: VarKeyEnum,
  max_width_mm: z.number().positive().optional(),
  font_family: z.string().min(1).optional(),
  font_size_pt: z.number().positive().optional(),
  font_weight: z.union([z.literal("normal"), z.literal("bold")]).optional(),
  align: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional(),
  transform: z.union([z.literal("uppercase"), z.literal("none")]).optional(),
  wrap: z.union([z.literal("truncate"), z.literal("wrap"), z.literal("scale-to-fit")]).optional(),
});

const TextNode = BaseNode.extend({
  type: z.literal("text"),
  text: z.string(),
  max_width_mm: z.number().positive().optional(),
  font_family: z.string().min(1).optional(),
  font_size_pt: z.number().positive().optional(),
  font_weight: z.union([z.literal("normal"), z.literal("bold")]).optional(),
  align: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional(),
});

const ImageNode = BaseNode.extend({
  type: z.literal("image"),
  assetId: z.number().int().positive(),
  width_mm: z.number().positive(),
  height_mm: z.number().positive(),
});

const LineNode = BaseNode.extend({
  type: z.literal("line"),
  x2_mm: z.number().min(0),
  y2_mm: z.number().min(0),
  stroke_width_mm: z.number().positive().optional(),
});

const RectNode = BaseNode.extend({
  type: z.literal("rect"),
  width_mm: z.number().positive(),
  height_mm: z.number().positive(),
});

const LienzoJsonSchema = z.object({
  meta: z.object({
    units: z.literal("mm"),
    width_mm: z.number().positive(),
    height_mm: z.number().positive(),
    version: z.number().int().min(1),
  }),
  nodes: z.array(z.union([VarTextNode, TextNode, ImageNode, LineNode, RectNode])).min(1),
});

// ---------- Schemas de acciones ----------
export const CrearDisenoSchema = z.object({
  nombre: z.string().min(1),
  ancho_mm: z.number().positive(),
  alto_mm: z.number().positive(),
  dpi_previsualizacion: z.number().positive().optional(),
  lienzo_json: LienzoJsonSchema,       // <- objeto validado
  estado: z.custom<EstadoDiseno>().optional(), // default: 'borrador'
});

export const ActualizarDisenoSchema = z.object({
  id: z.number().int().positive(),
  data: z.object({
    nombre: z.string().min(1).optional(),
    ancho_mm: z.number().positive().optional(),
    alto_mm: z.number().positive().optional(),
    dpi_previsualizacion: z.number().positive().optional(),
    lienzo_json: LienzoJsonSchema.optional(),
    estado: z.custom<EstadoDiseno>().optional(),
  }),
});

// ---------- Actions ----------
export async function crearDisenoPat(input: z.infer<typeof CrearDisenoSchema>) {
  const { username } = await assertRolPersonalPases();
  const data = CrearDisenoSchema.parse(input);

  // Aseguramos compatibilidad con JsonValue (structural)
  const lienzoJson: JsonValue = data.lienzo_json as unknown as JsonValue;

  return insertarDisenoPat({
    nombre: data.nombre,
    ancho_mm: data.ancho_mm,
    alto_mm: data.alto_mm,
    dpi_previsualizacion: data.dpi_previsualizacion,
    lienzo_json: lienzoJson,
    estado: data.estado,
    creado_por: username,
  });
}

export async function editarDisenoPat(input: z.infer<typeof ActualizarDisenoSchema>) {
  const { username } = await assertRolPersonalPases();
  const { id, data } = ActualizarDisenoSchema.parse(input);

  const lienzoJson: JsonValue | undefined =
    data.lienzo_json ? (data.lienzo_json as unknown as JsonValue) : undefined;

  return actualizarDisenoPat(id, {
    nombre: data.nombre,
    ancho_mm: data.ancho_mm,
    alto_mm: data.alto_mm,
    dpi_previsualizacion: data.dpi_previsualizacion,
    lienzo_json: lienzoJson,
    estado: data.estado,
    actualizado_por: username,
  });
}

export async function publicarDisenoPatAction(id: number) {
  await assertRolPersonalPases();
  // publicar/archivar no requieren username para persistir, pero si querés loguearlo podés
  return publicarDiseno(id, "system");
}

export async function archivarDisenoPatAction(id: number) {
  await assertRolPersonalPases();
  return archivarDiseno(id, "system");
}

// ---------- Recursos (assets) ----------
export const SubirRecursoSchema = z.object({
  diseno_id: z.number().int().positive(),
  nombre: z.string().min(1),
  mime_type: z.string().min(1),
  datos: z.instanceof(Buffer), // desde FormData convertir a Buffer en el server
});

export async function subirRecursoAction(input: z.infer<typeof SubirRecursoSchema>) {
  await assertRolPersonalPases();
  const data = SubirRecursoSchema.parse(input);
  return insertarRecursoDisenoPat(data);
}

// ---------- Auditoría de impresión ----------
export const RegistrarImpresionSchema = z.object({
  pat_id: z.number().int().positive(),
  diseno_id: z.number().int().positive(),
  copias: z.number().int().positive().optional(),
  variables_resueltas: z.custom<JsonValue>(), // { NRO_INTERNO: "...", ... }
});

export async function registrarImpresionAction(input: z.infer<typeof RegistrarImpresionSchema>) {
  const { username } = await assertRolPersonalPases();
  const data = RegistrarImpresionSchema.parse(input);
  await registrarLogImpresion({
    pat_id: data.pat_id,
    diseno_id: data.diseno_id,
    impreso_por: username,
    copias: data.copias,
    variables_resueltas: data.variables_resueltas,
  });
  return { ok: true };
}
