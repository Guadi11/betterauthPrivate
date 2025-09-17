// components/Pases/Disenos/crear-diseno-pat-form.tsx
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

// -------- Zod
export const DisenoPatFormSchema = z.object({
  nombre: z.string({ required_error: 'Ingresá un nombre.' })
    .trim().min(3, 'Mínimo 3 caracteres.').max(100, 'Máximo 100.'),
  ancho_mm: z.coerce.number({ required_error: 'Ingresá el ancho.' })
    .positive('Debe ser mayor a 0.').max(1000, 'Máx 1000 mm.')
    .multipleOf(0.01, 'Hasta 2 decimales.'),
  alto_mm: z.coerce.number({ required_error: 'Ingresá el alto.' })
    .positive('Debe ser mayor a 0.').max(1000, 'Máx 1000 mm.')
    .multipleOf(0.01, 'Hasta 2 decimales.'),
  dpi_previsualizacion: z.coerce.number({ required_error: 'Ingresá el DPI.' })
    .int('Debe ser entero.').min(72, 'Mín 72 DPI.').max(1200, 'Máx 1200 DPI.'),
});
export type DisenoPatFormValues = z.infer<typeof DisenoPatFormSchema>;

// -------- DTO
export type NuevoDisenoPatInput = {
  nombre: string;
  ancho_mm: number;
  alto_mm: number;
  dpi_previsualizacion: number;
  estado: 'borrador';
  lienzo_json: unknown;
  creado_por: string;
  creado_en: string;       // ISO
  actualizado_en: string;  // ISO
};

// Helper seguro para extraer el username sin usar `any`
function pickUsername(sessionData: unknown): string {
  if (typeof sessionData !== 'object' || sessionData === null) return 'usuarionulo';
  const record = sessionData as Record<string, unknown>;
  const user = record.user as unknown;
  if (typeof user !== 'object' || user === null) return 'usuarionulo';
  const u = user as Record<string, unknown>;

  const username = typeof u.username === 'string' && u.username.length > 0 ? u.username : null;
  const displayUsername = typeof u.displayUsername === 'string' && u.displayUsername.length > 0 ? u.displayUsername : null;
  const name = typeof u.name === 'string' && u.name.length > 0 ? u.name : null;
  const email = typeof u.email === 'string' && u.email.length > 0 ? u.email : null;

  return username ?? displayUsername ?? name ?? email ?? 'usuarionulo';
}

// Builder para armar el payload con defaults
export function buildNuevoDisenoPayload(
  values: DisenoPatFormValues,
  opts?: { creadoPor?: string },
): NuevoDisenoPatInput {
  const nowIso = new Date().toISOString();
  const lienzo: unknown = {
    version: 1,
    mm: { width: values.ancho_mm, height: values.alto_mm },
    dpi: values.dpi_previsualizacion,
    layers: [] as unknown[],
    elements: [] as unknown[],
  };

  return {
    ...values,
    estado: 'borrador',
    lienzo_json: lienzo,
    creado_por: opts?.creadoPor ?? 'USUARIONULO',
    creado_en: nowIso,
    actualizado_en: nowIso,
  };
}

// -------- Form
export function CrearDisenoPatForm(props: {
  onCreate?: (payload: NuevoDisenoPatInput) => void | Promise<void>;
}) {
  const form = useForm<DisenoPatFormValues>({
    resolver: zodResolver(DisenoPatFormSchema),
    defaultValues: { nombre: '', ancho_mm: 120, alto_mm: 120, dpi_previsualizacion: 300 },
    mode: 'onBlur',
  });

  // session del usuario (Better Auth)
  const { data: session } = authClient.useSession(); // devuelve { user, session, ... }

  async function onSubmit(values: DisenoPatFormValues) {
    const creadoPor = pickUsername(session);
    const payload = buildNuevoDisenoPayload(values, { creadoPor });

    if (props.onCreate) {
      await props.onCreate(payload);
    } else {
      console.log('Nuevo diseño (payload listo):', payload);
    }
  }

  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const blocked = ['e', 'E', '+', '-', '.', ','];
    if (blocked.includes(e.key)) e.preventDefault();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PAT Familiar v1" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="ancho_mm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancho (mm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} max={1000} inputMode="decimal"
                    {...field} onChange={(e) => field.onChange(e.target.value)} />
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
                  <Input type="number" step="0.01" min={0} max={1000} inputMode="decimal"
                    {...field} onChange={(e) => field.onChange(e.target.value)} />
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
                  <Input type="number" min={72} max={1200} step="1" inputMode="numeric"
                    onKeyDown={blockNonIntegerKeys} {...field}
                    onChange={(e) => field.onChange(e.target.value)} />
                </FormControl>
                <FormDescription>Si lo dejás vacío, se usa 300 DPI (default).</FormDescription>
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
