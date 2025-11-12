import { z } from "zod";

export const RegistroSchema = z.object({
  documento: z
    .string()
    .min(7, "El documento debe tener al menos 7 caracteres")
    .max(20, "El documento no puede superar 20 caracteres")
    .trim()
    // Uppercase siempre: no afecta a DNI y normaliza Pasaporte
    .transform((s) => s.toUpperCase()),
  tipo_documento: z.enum(["DNI", "Pasaporte"], {
    errorMap: () => ({ message: "Tipo de documento debe ser DNI o Pasaporte" }),
  }),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100).trim(),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(100).trim(),
  fecha_nacimiento: z.date().max(new Date(), { message: "La fecha de nacimiento no puede ser futura" }).optional(),
  nacionalidad: z.string().max(100).optional(),
  domicilio_real: z.string().max(255).optional(),
  domicilio_eventual: z.string().max(255).optional(),
  observacion_cc: z.boolean().default(false),
}).superRefine((data, ctx) => {
  const doc = data.documento;
  if (data.tipo_documento === "DNI") {
    if (!/^\d{7,8}$/.test(doc)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documento"],
        message: "Para DNI el documento debe tener 7 u 8 dígitos numéricos.",
      });
    }
  } else {
    if (!/^[A-Z0-9]{6,20}$/.test(doc)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documento"],
        message: "Para Pasaporte el documento debe ser alfanumérico (6–20).",
      });
    }
  }
});

export type RegistroFormData = z.infer<typeof RegistroSchema>;
