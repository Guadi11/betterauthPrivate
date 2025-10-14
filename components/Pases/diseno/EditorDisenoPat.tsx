// components/Pases/diseno/EditorDisenoPat.tsx
'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { DisenoPatRow as DisenoPat } from '@/lib/pat/disenos/diseno-pat-types';
import { guardarDisenoPat } from '@/lib/database/diseno-pat-actions';
import { subirRecursoDiseno } from '@/lib/database/diseno-recursos-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import EditorCanvasKonva from './EditorCanvasKonva';
import CanvasToolbar from './editor/CanvasToolbar';
import GridControls from './editor/GridControls';
import VariablesPanel from './editor/VariablesPanel';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';
import type { Vars } from '@/lib/pat/disenos/editor/vars';

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

// debounce simple
function useDebouncedEffect(effect: () => void, deps: React.DependencyList, delayMs: number) {
  React.useEffect(() => {
    const id = window.setTimeout(effect, delayMs);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
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

  // Grid + Snap UI state
  const [gridStepMm, setGridStepMm] = useState<number>(1);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(false);

  // Variables para futuros reemplazos (si querés usarlas luego en preview/export)
  const [vars, setVars] = useState<Vars>({
    registro: { nombre: 'Juan', apellido: 'Pérez', documento: '12345678' },
    solicitante: { nombre: 'Cap. Gómez' },
  });

  const onCanvasChange = useCallback((newJson: string) => {
    setJsonString(newJson);
    try {
      form.setValue('lienzo_json', JSON.parse(newJson) as unknown, { shouldDirty: true });
    } catch {
      form.setValue('lienzo_json', newJson as unknown, { shouldDirty: true });
    }
  }, [form]);

  // AUTOSAVE — guarda todo el form
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');

  const doSave = useCallback(async () => {
    const values = form.getValues();
    setIsSaving(true);
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
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar el diseño');
    } finally {
      setIsSaving(false);
      form.reset(values);
    }
  }, [form]);

  useDebouncedEffect(() => {
    if (!form.formState.isDirty) return;
    if (isSaving) return;
    void doSave();
  }, [jsonString, mmAncho, mmAlto, dpi, form.formState.isDirty], 1200);

  const handleGuardar = async () => {
    await doSave();
    toast.success('Diseño guardado');
  };

  // Toolbar: subir imagen → inserta en canvas via evento
  const dispatch = (name: (typeof EditorEvent)[keyof typeof EditorEvent], detail?: unknown) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const onUploadImage = async (file: File) => {
    const fd = new FormData();
    fd.set('diseno_id', diseno.id);
    fd.set('file', file);
    const res = await subirRecursoDiseno(fd);
    dispatch(EditorEvent.ADD_IMAGE, { src: res.url });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
      {/* Panel izquierdo: formulario + toolbar + grid + variables */}
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); void handleGuardar(); }} className="space-y-4">
            <FormField name="nombre" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
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

            <CanvasToolbar onPickImage={onUploadImage} />
            <GridControls
              stepMm={gridStepMm}
              snapEnabled={snapEnabled}
              onChange={(next) => {
                if (typeof next.stepMm === 'number') setGridStepMm(next.stepMm);
                if (typeof next.snapEnabled === 'boolean') setSnapEnabled(next.snapEnabled);
              }}
            />
            <VariablesPanel vars={vars} onChange={setVars} />

            <div className="flex gap-3 items-center">
              <Button type="submit" variant="default" disabled={isSaving}>
                {isSaving ? 'Guardando…' : 'Guardar'}
              </Button>
              <div className="text-xs text-muted-foreground">
                {isSaving ? 'Guardando cambios…' : (lastSavedAt ? `Autoguardado a las ${lastSavedAt}` : 'Sin cambios')}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Panel derecho: SOLO editor */}
      <div>
        <div className="text-sm text-muted-foreground mb-2">Editor</div>
        <EditorCanvasKonva
          json={jsonString}
          mmAncho={mmAncho}
          mmAlto={mmAlto}
          dpi={dpi}
          gridStepMm={gridStepMm}
          snapEnabled={snapEnabled}
          onChange={onCanvasChange}
        />
      </div>
    </div>
  );
}
