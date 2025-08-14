"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useParams } from 'next/navigation'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button";
import { darIngreso } from "@/lib/database/ingreso-actions";
import { useRouter } from "next/navigation";
import SolicitanteSection from "@/components/solicitantes/seleccion-solicitante";

const ingresoSchema = z.object({
  lugar_visita: z.string().min(1, "Campo requerido"),
  motivo: z.string().min(1, "Campo requerido"),
  observacion: z.string().optional(),
  nro_tarjeta: z.object({
    prefijo: z.enum(["ZR", "ZC", "HN", "PS"]),
    sufijo: z.string().regex(/^\d{4}$/, "Debe tener 4 dígitos"),
  }),
});

const solicitanteSchema = z.object({
  identificador: z.string().min(1, "Campo requerido"),
  tipo_identificador: z.enum(["MR", "DNI"]),
  nombre: z.string().min(1, "Campo requerido"),
  jerarquia: z.string().min(1, "Campo requerido"),
  destino: z.string().min(1, "Campo requerido"),
  telefono: z.string().min(1, "Campo requerido"),
}).superRefine((val, ctx) => {
  const id = (val.identificador ?? "").trim();
  if (val.tipo_identificador === "DNI") {
    if (!/^\d{8}$/.test(id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identificador"],
        message: "DNI debe tener exactamente 8 dígitos (sin puntos).",
      });
    }
  } else { // MR
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

type FormData = z.infer<typeof IngresoConSolicitanteSchema>;

export default function DarIngreso() {
    const form = useForm<FormData>({
        resolver: zodResolver(IngresoConSolicitanteSchema),
        defaultValues: {
            ingreso: {
              lugar_visita: "",
              motivo: "",
              observacion: "",
              nro_tarjeta: {
                prefijo: "ZR",
                sufijo: "",
              }
            },
            solicitante: {
              identificador: "",
              tipo_identificador: "MR", // o "MR" si querés por default
              nombre: "",
              jerarquia: "",
              destino: "",
              telefono: "",
            },
          },
    });

    const params = useParams<{ documento: string }>();

    const router = useRouter();

    const onSubmit = async (data: FormData) => {
      const res = await darIngreso(params.documento, data);

      if (!res?.ok) {
        // Por campo específico
        if (res.field && res.field !== 'root') {
          // @ts-expect-error: path string válido para react-hook-form
          form.setError(res.field, { type: 'server', message: res.message });
          return;
        }

        // Error general (root)
        form.setError('root', { type: 'server', message: res.message ?? 'Error al dar ingreso.' });
        return;
      }

      // Éxito
      router.refresh();
      router.push(`/registro/${params.documento}`);
    };


    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Sección Ingreso */}
        <div>
          <h2 className="text-xl font-semibold">Datos del Ingreso</h2>
          <FormField
            control={form.control}
            name="ingreso.lugar_visita"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Lugar de Visita
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="HNPB" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ingreso.motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Motivo
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa por turno traumatologia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ingreso.observacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observación</FormLabel>
                <FormControl>
                  <Input placeholder="OBSERVACION - SIN OBSERVACION" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="ingreso.nro_tarjeta.prefijo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Prefijo
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ZR">ZR</SelectItem>
                      <SelectItem value="ZC">ZC</SelectItem>
                      <SelectItem value="HN">HN</SelectItem>
                      <SelectItem value="PS">PS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ingreso.nro_tarjeta.sufijo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Número Tarjeta
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="0458" maxLength={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

        {/* Sección Solicitante */}
        <SolicitanteSection />
              
        {form.formState.errors.root?.message && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {form.formState.errors.root.message}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <Button type="submit">Dar Ingreso</Button>
        </div>
      </form>
    </Form>
  );
}
