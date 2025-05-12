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

const ingresoSchema = z.object({
  lugar_visita: z.string().min(1, "Campo requerido"),
  motivo: z.string().min(1, "Campo requerido"),
  observacion: z.string().optional(),
  nro_tarjeta: z.string().min(1, "Campo requerido"),
});

const solicitanteSchema = z.object({
  identificador: z.string().min(1, "Campo requerido"),
  tipo_identificador: z.enum(["MR", "DNI"]),
  nombre: z.string().min(1, "Campo requerido"),
  jerarquia: z.string().min(1, "Campo requerido"),
  destino: z.string().min(1, "Campo requerido"),
  telefono: z.string().min(1, "Campo requerido"),
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
              nro_tarjeta: "",
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
        await darIngreso(params.documento, data);
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
                <FormLabel>Lugar de Visita</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Motivo</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ingreso.nro_tarjeta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° Tarjeta</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sección Solicitante */}
        <div className="pt-4 border-t">
          <h2 className="text-xl font-semibold">Datos del Solicitante</h2>

          <FormField
            control={form.control}
            name="solicitante.identificador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitante.tipo_identificador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Identificador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="MR">MR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitante.nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitante.jerarquia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jerarquía</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitante.destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solicitante.telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center mt-4">
          <Button type="submit">Dar Ingreso</Button>
        </div>
      </form>
    </Form>
  );
}
