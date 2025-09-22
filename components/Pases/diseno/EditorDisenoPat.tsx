// components/Pases/EditorDisenoPat.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import type { DisenoPat } from '@/lib/database/diseno-pat-queries';
import { guardarDisenoPat } from '@/lib/database/diseno-pat-actions';
import KonvaJsonViewer from './KonvaJsonViewer';

const LienzoSchema = z.unknown(); // primera iteración: aceptamos cualquier estructura
// Siguiente paso: definir esquema para nuestro JSON de Konva (nodes, attrs, etc.)

const DisenoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1, 'Requerido'),
  ancho_mm: z.coerce.number().positive(),
  alto_mm: z.coerce.number().positive(),
  dpi_previsualizacion: z.coerce.number().int().positive(),
  estado: z.enum(['borrador', 'publicado', 'archivado']),
  lienzo_json: LienzoSchema,
});

type DisenoForm = z.infer<typeof DisenoSchema>;

export default function EditorDisenoPat({ diseno }: { diseno: DisenoPat }) {
  const defaultValues = useMemo<DisenoForm>(() => ({
    id: diseno.id,
    nombre: diseno.nombre,
    ancho_mm: diseno.ancho_mm,
    alto_mm: diseno.alto_mm,
    dpi_previsualizacion: diseno.dpi_previsualizacion,
    estado: diseno.estado,
    lienzo_json: diseno.lienzo_json,
  }), [diseno]);

  const form = useForm<DisenoForm>({
    resolver: zodResolver(DisenoSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Estado local para el canvas (muy básico en esta iteración)
  const [konvaNodes, setKonvaNodes] = useState<unknown>(diseno.lienzo_json ?? null);

  // Demo: si no hay JSON, iniciamos con 1 rect + 1 text para visualizar
  useEffect(() => {
    if (!konvaNodes) {
      const demo = {
        type: 'root',
        children: [
          { type: 'rect', x: 40, y: 40, width: 200, height: 120 },
          { type: 'text', x: 50, y: 50, text: 'PAT Demo' },
        ],
      };
      setKonvaNodes(demo);
      form.setValue('lienzo_json', demo);
    }
  }, [konvaNodes, form]);

  const onSubmit = async (values: DisenoForm) => {
    try {
      await guardarDisenoPat({
        id: values.id,
        nombre: values.nombre,
        ancho_mm: values.ancho_mm,
        alto_mm: values.alto_mm,
        dpi_previsualizacion: values.dpi_previsualizacion,
        estado: values.estado,
        lienzo_json: values.lienzo_json,
      });
      toast.success('Diseño guardado');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar el diseño');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario metadatos */}
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="ancho_mm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ancho (mm)</FormLabel>
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
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
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dpi_previsualizacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DPI</FormLabel>
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="archivado">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Canvas / Previsualización */}
      <div className="rounded-2xl border p-3 bg-muted">
        <div className="text-sm text-muted-foreground mb-2">
          Previsualización (tamaño según mm/DPI del diseño)
        </div>
          <div className="overflow-auto rounded-xl border bg-background p-2">
            <KonvaJsonViewer
              lienzo={form.watch('lienzo_json')}
              mmAncho={form.watch('ancho_mm')}
              mmAlto={form.watch('alto_mm')}
              dpi={form.watch('dpi_previsualizacion')}
            />
          </div>
        </div>
      </div>
  );
}
