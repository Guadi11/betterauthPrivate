// lib/zod/ingreso-schemas.ts
import { z } from "zod";

export const ingresoSchema = z.object({
  lugar_visita: z.string().min(1, "Campo requerido"),
  motivo: z.string().min(1, "Campo requerido"),
  observacion: z.string().optional(),
  nro_tarjeta: z.object({
    prefijo: z.enum(["ZR", "ZC", "HN", "PS"]),
    sufijo: z.string().regex(/^\d{4}$/, "Debe tener 4 dígitos"),
  }),
});

export const solicitanteSchema = z.object({
  identificador: z.string().min(1, "Campo requerido"),
  tipo_identificador: z.enum(["MR", "DNI"]),
  nombre: z.string().min(1, "Campo requerido"),
  jerarquia: z.string().min(1, "Campo requerido"),
  destino: z.string().min(1, "Campo requerido"),
  telefono: z.string().min(1, "Campo requerido"),
}).superRefine((val, ctx) => {
  const id = val.identificador.trim();

  if (val.tipo_identificador === "DNI") {
    if (!/^\d{8}$/.test(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identificador"],
        message: "DNI debe tener exactamente 8 dígitos (sin puntos).",
      });
    }
  } else {
    if (!/^\d{7}$/.test(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identificador"],
        message: "Matrícula (MR) debe tener exactamente 7 dígitos.",
      });
    }
  }
});

export const IngresoConSolicitanteSchema = z.object({
  ingreso: ingresoSchema,
  solicitante: solicitanteSchema,
});

export type IngresoConSolicitanteFormData = z.infer<
  typeof IngresoConSolicitanteSchema
>;
