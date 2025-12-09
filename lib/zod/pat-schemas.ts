import { z } from "zod";
import { solicitanteSchema } from "@/lib/zod/ingreso-schemas"; // Reutilizamos este

export const patSchema = z.object({
  fecha_extension: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
  fecha_vencimiento: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
  tipo_zona: z.enum(["ZC", "ZR", "HN", "PS", "OT"], {
    errorMap: () => ({ message: "Seleccione un tipo de zona válido" }),
  }),
  acceso_pat: z.string().min(1, "El lugar de acceso es requerido").max(100),
  nro_interno: z
    .string()
    .regex(/^\d{4,5}$/, "Debe ser un número de 4 o 5 dígitos"),
  causa_motivo_pat: z.string().min(5, "El motivo debe ser más descriptivo"),
});

// Esquema combinado
export const ConfeccionarPatSchema = z.object({
  pat: patSchema,
  solicitante: solicitanteSchema, // Reutilizamos la lógica de DNI/MR aquí
}).superRefine((data, ctx) => {
  // Validación cruzada de fechas: Vencimiento no puede ser menor a Extensión
  const extension = new Date(data.pat.fecha_extension);
  const vencimiento = new Date(data.pat.fecha_vencimiento);

  if (vencimiento < extension) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pat", "fecha_vencimiento"],
      message: "El vencimiento no puede ser anterior a la extensión.",
    });
  }
});

export type ConfeccionarPatFormData = z.infer<typeof ConfeccionarPatSchema>;