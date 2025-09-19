'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import { crearDisenoPat } from '@/lib/database/diseno-pat-actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// -------- Zod
export const DisenoPatFormSchema = z.object({
  nombre: z.string({ required_error: 'Ingresá un nombre.' }).trim().min(3, 'Mínimo 3.').max(100, 'Máximo 100.'),
  ancho_mm: z.coerce.number({ required_error: 'Ingresá el ancho.' }).positive('> 0.').max(1000, 'Máx 1000.').multipleOf(0.01, 'Hasta 2 decimales.'),
  alto_mm: z.coerce.number({ required_error: 'Ingresá el alto.' }).positive('> 0.').max(1000, 'Máx 1000.').multipleOf(0.01, 'Hasta 2 decimales.'),
  dpi_previsualizacion: z.coerce.number({ required_error: 'Ingresá el DPI.' }).int('Entero.').min(72, '≥72.').max(1200, '≤1200.'),
});
export type DisenoPatFormValues = z.infer<typeof DisenoPatFormSchema>;

// -------- Helpers sin any
function pickUsername(sessionData: unknown): string {
  if (typeof sessionData !== 'object' || sessionData === null) return 'usuarioPruebaPases';
  const rec = sessionData as Record<string, unknown>;
  const user = rec.user as unknown;
  if (typeof user !== 'object' || user === null) return 'usuarioPruebaPases';
  const u = user as Record<string, unknown>;
  const username = typeof u.username === 'string' && u.username.length > 0 ? u.username : null;
  const displayUsername = typeof u.displayUsername === 'string' && u.displayUsername.length > 0 ? u.displayUsername : null;
  const name = typeof u.name === 'string' && u.name.length > 0 ? u.name : null;
  const email = typeof u.email === 'string' && u.email.length > 0 ? u.email : null;
  return username ?? displayUsername ?? name ?? email ?? 'usuarioPruebaPases';
}

export function CrearDisenoPatForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<DisenoPatFormValues>({
    resolver: zodResolver(DisenoPatFormSchema),
    defaultValues: { nombre: '', ancho_mm: 120, alto_mm: 120, dpi_previsualizacion: 300 },
    mode: 'onBlur',
  });

  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const blocked = ['e', 'E', '+', '-', '.', ','];
    if (blocked.includes(e.key)) e.preventDefault();
  };

  function onSubmit(values: DisenoPatFormValues) {
    startTransition(async () => {
      const nowIso = new Date().toISOString();
      const payload = {
        ...values,
        estado: 'borrador' as const,
        lienzo_json: {
          version: 1,
          mm: { width: values.ancho_mm, height: values.alto_mm },
          dpi: values.dpi_previsualizacion,
          layers: [] as unknown[],
          elements: [] as unknown[],
        } as unknown,
        creado_por: pickUsername(session),
        creado_en: nowIso,
        actualizado_en: nowIso,
      };

      const res = await crearDisenoPat(payload);
      if (res.ok) {
        // Redirigí donde prefieras (listado o editor):
        router.push('/pat/disenos'); // o `/pat/disenos/${res.id}/editar`
      } else {
        // Podés reemplazar con toast
        console.error(res.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl><Input placeholder="Ej: PAT Familiar v1" autoComplete="off" {...field} /></FormControl>
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
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
