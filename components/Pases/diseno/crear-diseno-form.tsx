// components/Pases/diseno/crear-diseno-form.tsx
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
import { disenoPatCoreSchema, estadoDisenoEnum } from '@/lib/pat/disenos/diseno-pat-schemas';

// -------- Helpers sin any
function pickUserId(sessionData: unknown): string {
  if (typeof sessionData !== 'object' || sessionData === null) return 'usuarioPruebaPases';
  const rec = sessionData as Record<string, unknown>;
  const user = rec.user as unknown;
  if (typeof user !== 'object' || user === null) return 'usuarioPruebaPases';
  const u = user as Record<string, unknown>;
  const id = typeof u.id === 'string' && u.id.length > 0 ? u.id : null;
  const username = typeof u.username === 'string' && u.username.length > 0 ? u.username : null;
  return id ?? username ?? 'usuarioPruebaPases';
}

const CrearSchema = disenoPatCoreSchema
  .omit({ lienzo_json: true, estado: true })
  .extend({
    // mantenemos la UX actual del form
    nombre: z.string().trim().min(3).max(100),
    ancho_mm: z.coerce.number().positive().max(1000).multipleOf(0.01),
    alto_mm: z.coerce.number().positive().max(1000).multipleOf(0.01),
    dpi_previsualizacion: z.coerce.number().int().min(72).max(1200),
  });

export type DisenoPatFormValues = z.infer<typeof CrearSchema>;

// mm → px con DPI
function mmToPx(mm: number, dpi: number): number {
  return Math.max(100, Math.round((mm / 25.4) * dpi));
}

export function CrearDisenoPatForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<DisenoPatFormValues>({
    resolver: zodResolver(CrearSchema),
    defaultValues: { nombre: '', ancho_mm: 120, alto_mm: 120, dpi_previsualizacion: 300 },
    mode: 'onBlur',
  });

  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const blocked = ['e', 'E', '+', '-', '.', ','];
    if (blocked.includes(e.key)) e.preventDefault();
  };

  function onSubmit(values: DisenoPatFormValues) {
    startTransition(async () => {
      // JSON inicial de Konva “puro” (Stage con una Layer):
      const widthPx = mmToPx(values.ancho_mm, values.dpi_previsualizacion);
      const heightPx = mmToPx(values.alto_mm, values.dpi_previsualizacion);
      const initialKonvaJson = {
        className: 'Stage',
        attrs: { width: widthPx, height: heightPx },
        children: [{ className: 'Layer', attrs: {} }],
      } as const;

      const res = await crearDisenoPat({
        nombre: values.nombre,
        ancho_mm: values.ancho_mm,
        alto_mm: values.alto_mm,
        dpi_previsualizacion: values.dpi_previsualizacion,
        lienzo_json: initialKonvaJson, // objeto → ::jsonb
        estado: estadoDisenoEnum.enum.borrador,
        // dejamos que la action ponga creado_por desde session si no lo enviamos
        creado_por: pickUserId(session),
        session, // para que action pueda tomar user.id si quisieras omitir el campo
      });

      if (res.ok) {
        router.push('/pat/disenos'); // o `/pat/disenos/${res.id}/editar`
      } else {
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
