'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { DisenoPatRow as DisenoPat } from '@/lib//pat/disenos/diseno-pat-types';
import { guardarDisenoPat } from '@/lib/database/diseno-pat-actions';
import { subirRecursoDiseno } from '@/lib/database/diseno-recursos-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import EditorCanvasKonva from './EditorCanvasKonva';
import KonvaJsonViewer from './KonvaJsonViewer';

const DisenoSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  ancho_mm: z.coerce.number().positive(),
  alto_mm: z.coerce.number().positive(),
  dpi_previsualizacion: z.coerce.number().int().positive(),
  estado: z.enum(['borrador', 'publicado', 'archivado']),
  lienzo_json: z.unknown(),
});

type DisenoForm = z.infer<typeof DisenoSchema>;

function resolveVarsInKonvaJson(jsonStr: string, vars: Record<string, unknown>): string {
  try {
    const obj = JSON.parse(jsonStr) as unknown;
    const replacer = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      const r = node as { className?: unknown; attrs?: unknown; children?: unknown };
      if (r.className === 'Text' && r.attrs && typeof r.attrs === 'object') {
        const a = r.attrs as Record<string, unknown>;
        const original = typeof a.text === 'string' ? a.text : '';
        const replaced = original.replace(/\$\{([a-zA-Z0-9_.]+)\}/g, (_m, p1) => {
          const path = String(p1).split('.');
          let current: unknown = vars;
          for (const key of path) {
            if (current && typeof current === 'object') {
              current = (current as Record<string, unknown>)[key];
            } else {
              current = undefined;
              break;
            }
          }
          return current == null ? '' : String(current);
        });
        a.text = replaced;
      }
      if (Array.isArray(r.children)) r.children.forEach(replacer);
    };
    replacer(obj);
    return JSON.stringify(obj);
  } catch {
    return jsonStr;
  }
}


export default function EditorDisenoPat({ diseno }: { diseno: DisenoPat }) {
  const [jsonString, setJsonString] = useState<string>(
    typeof diseno.lienzo_json === 'string' ? diseno.lienzo_json : JSON.stringify(diseno.lienzo_json ?? {})
  );

  const form = useForm<DisenoForm>({
    resolver: zodResolver(DisenoSchema),
    defaultValues: {
      id: diseno.id,
      nombre: diseno.nombre,
      ancho_mm: diseno.ancho_mm,
      alto_mm: diseno.alto_mm,
      dpi_previsualizacion: diseno.dpi_previsualizacion,
      estado: diseno.estado,
      lienzo_json: diseno.lienzo_json,
    },
    mode: 'onChange',
  });

  const mmAncho = form.watch('ancho_mm');
  const mmAlto = form.watch('alto_mm');
  const dpi = form.watch('dpi_previsualizacion');

  // Dummy variables para preview (podés reemplazar con inputs)
  const [vars, setVars] = useState<Record<string, unknown>>({
    registro: { nombre: 'Juan', apellido: 'Pérez', documento: '12345678' },
    solicitante: { nombre: 'Cap. Gómez' },
  });

  const onCanvasChange = useCallback((newJson: string) => {
    setJsonString(newJson);
    // mantenemos el form sincronizado
    try {
      form.setValue('lienzo_json', JSON.parse(newJson) as unknown);
    } catch {
      form.setValue('lienzo_json', newJson as unknown);
    }
  }, [form]);

  const handleGuardar = async (values: DisenoForm) => {
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

  // Toolbar
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dispatch = (name: 'editor:addRect'|'editor:addText'|'editor:addImage', detail?: unknown) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const onUploadImage = async (file: File) => {
    const fd = new FormData();
    fd.set('diseno_id', diseno.id);
    fd.set('file', file);
    const res = await subirRecursoDiseno(fd);
    // Insertar imagen en el canvas
    dispatch('editor:addImage', { src: res.url });
  };

  const resolvedJsonForPreview = useMemo(() => resolveVarsInKonvaJson(jsonString, vars), [jsonString, vars]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
      {/* Panel izquierdo: formulario + toolbar */}
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGuardar)} className="space-y-4">
            <FormField name="nombre" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-3">
              <FormField name="ancho_mm" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Ancho (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="alto_mm" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Alto (mm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="dpi_previsualizacion" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>DPI</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => dispatch('editor:addRect')}>Rectángulo</Button>
              <Button type="button" variant="secondary" onClick={() => dispatch('editor:addText')}>Texto</Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.currentTarget.files?.[0];
                  if (f) await onUploadImage(f);
                  if (fileRef.current) fileRef.current.value = '';
                }}
              />
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                Imagen…
              </Button>
            </div>

            <Button type="submit" className="mt-2">Guardar</Button>
          </form>
        </Form>

        {/* Variables de preview rápidas */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Variables de prueba (preview)</div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Nombre"
              defaultValue={String((vars.registro as { nombre?: unknown }).nombre ?? '')}
              onChange={(e) => setVars(v => ({ ...v, registro: { ...(v.registro as Record<string, unknown>), nombre: e.target.value } }))}
            />
            <Input
              placeholder="Apellido"
              defaultValue={String((vars.registro as { apellido?: unknown }).apellido ?? '')}
              onChange={(e) => setVars(v => ({ ...v, registro: { ...(v.registro as Record<string, unknown>), apellido: e.target.value } }))}
            />
          </div>
        </div>
      </div>

      {/* Panel derecho: Editor (izq) + Preview (der) */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Editor</div>
          <EditorCanvasKonva
            json={jsonString}
            mmAncho={mmAncho}
            mmAlto={mmAlto}
            dpi={dpi}
            onChange={onCanvasChange}
          />
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Vista previa (placeholders resueltos)</div>
          <div className="rounded-xl border p-2 bg-muted">
            <KonvaJsonViewer
              lienzo={resolvedJsonForPreview}
              mmAncho={mmAncho}
              mmAlto={mmAlto}
              dpi={dpi}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
