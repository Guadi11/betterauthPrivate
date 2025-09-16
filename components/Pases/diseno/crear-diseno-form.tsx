// components/Pases/Disenos/crear-diseno-pat-form.tsx
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ==========================
// 1) Zod: validación del form
// ==========================
export const DisenoPatFormSchema = z.object({
  nombre: z
    .string({ required_error: 'Ingresá un nombre.' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(100, 'Máximo 100 caracteres.'),
  ancho_mm: z
    .coerce
    .number({ required_error: 'Ingresá el ancho.' })
    .positive('Debe ser mayor a 0.')
    .max(1000, 'Máximo 1000 mm.')
    .multipleOf(0.01, 'Usá hasta 2 decimales.'),
  alto_mm: z
    .coerce
    .number({ required_error: 'Ingresá el alto.' })
    .positive('Debe ser mayor a 0.')
    .max(1000, 'Máximo 1000 mm.')
    .multipleOf(0.01, 'Usá hasta 2 decimales.'),
  dpi_previsualizacion: z
    .coerce
    .number({ required_error: 'Ingresá el DPI.' })
    .int('Debe ser un número entero.')
    .min(72, 'Mínimo 72 DPI.')
    .max(1200, 'Máximo 1200 DPI.'),
});

export type DisenoPatFormValues = z.infer<typeof DisenoPatFormSchema>;

// ==========================================
// 2) DTO que más adelante enviará la action
//    (con defaults solicitados)
// ==========================================
export type NuevoDisenoPatInput = {
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;

  // Defaults calculados en el cliente
  estado: 'borrador';
  lienzo_json: unknown;
  creado_por: string;
  creado_en: string;       // ISO
  actualizado_en: string;  // ISO
};

// Builder para armar el payload con defaults
export function buildNuevoDisenoPayload(
  values: DisenoPatFormValues,
): NuevoDisenoPatInput {
  const nowIso = new Date().toISOString();

  // Estructura mínima para iniciar el editor con Konva más adelante
  const lienzo: unknown = {
    version: 1,
    mm: { width: values.ancho_mm, height: values.alto_mm },
    dpi: values.dpi_previsualizacion,
    // Espacio para que luego el editor agregue capas y elementos
    layers: [] as unknown[],
    elements: [] as unknown[],
  };

  return {
    ...values,
    estado: 'borrador',
    lienzo_json: lienzo,
    creado_por: 'usuarioPruebaPases',
    creado_en: nowIso,
    actualizado_en: nowIso,
  };
}

// ==========================================
// 3) Componente del formulario (ShadCN + RHF)
// ==========================================
export function CrearDisenoPatForm(props: {
  /**
   * Callback opcional: el contenedor (page) puede recibir el
   * payload listo para insertar. Si no se provee, se hace console.log.
   */
  onCreate?: (payload: NuevoDisenoPatInput) => void | Promise<void>;
}) {
  const form = useForm<DisenoPatFormValues>({
    resolver: zodResolver(DisenoPatFormSchema),
    defaultValues: {
      nombre: '',
      ancho_mm: 120,
      alto_mm: 120,
      dpi_previsualizacion: 300,
    },
    mode: 'onBlur',
  });

  async function onSubmit(values: DisenoPatFormValues) {
    const payload = buildNuevoDisenoPayload(values);
    if (props.onCreate) {
      await props.onCreate(payload);
    } else {
      // Temporal: luego esto llamará a la server action de inserción
      // y redirección. Por ahora dejamos un log para testear validación.
      // eslint-disable-next-line no-console
      console.log('Nuevo diseño (payload listo):', payload);
    }
  }

  // Bloquea caracteres no numéricos en el campo DPI (mejora UX; zod valida igual)
  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const blocked = ['e', 'E', '+', '-', '.', ','];
    if (blocked.includes(e.key)) e.preventDefault();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: PAT Familiar v1"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="ancho_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1000}
                    inputMode="decimal"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alto_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alto (mm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1000}
                    inputMode="decimal"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dpi_previsualizacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DPI (previsualización)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={72}
                    max={1200}
                    step="1"
                    inputMode="numeric"
                    onKeyDown={blockNonIntegerKeys}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Si lo dejás vacío, se usa 300 DPI (default).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
