// /components/Pases/diseno/editor/CanvasToolbar.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { VARIABLE_CATALOG } from '@/lib/pat/disenos/editor/variable-catalog';
import { Toggle } from '@/components/ui/toggle';
import { Underline, Bold } from 'lucide-react';

interface Props {
  onOpenRecursos: () => void;
}

export default function CanvasToolbar({ onOpenRecursos  }: Props) {

  const [openQuick, setOpenQuick] = React.useState<boolean>(false);
  const [quickText, setQuickText] = React.useState<string>('');

  const [fill, setFill] = React.useState<string>('#111111');
  const [bold, setBold] = React.useState<boolean>(false);
  const [underline, setUnderline] = React.useState<boolean>(false);

  const dispatch = (name: (typeof EditorEvent)[keyof typeof EditorEvent], detail?: unknown) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const addQuickText = () => {
    const val = quickText.trim();
    if (val.length === 0) return;

    const fontStyle = bold ? 'bold' : 'normal' as const;
    const textDecoration = underline ? 'underline' : undefined;

    dispatch(EditorEvent.ADD_TEXT, {
      text: val,
      style: {
        fill,
        fontStyle,        // 'normal' | 'bold'
        textDecoration,   // 'underline' | undefined
      },
    });

    setQuickText('');
    setOpenQuick(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={() => dispatch(EditorEvent.ADD_RECT)}>
        Rectángulo
      </Button>

      <Button type="button" variant="secondary" onClick={onOpenRecursos}>
        Recursos…
      </Button>

      {/* Variables (dropdown) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="secondary">Variables</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Insertar variable</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {VARIABLE_CATALOG.map(v => (
            <DropdownMenuItem
              key={v.key}
              onClick={() => dispatch(EditorEvent.ADD_VARIABLE, { key: v.key })}
            >
              {v.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Texto rápido + estilos 1:1 Konva */}
      <Popover open={openQuick} onOpenChange={setOpenQuick}>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary">Texto rápido…</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-3">
          <Textarea
            placeholder="Escribí acá y agregalo al canvas…"
            rows={5}
            value={quickText}
            onChange={(e) => setQuickText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                addQuickText();
              }
            }}
          />

          {/* Controles de estilo */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm text-muted-foreground">Color</label>
            <input
              type="color"
              className="h-9 w-16 rounded-md border"
              value={fill}
              onChange={(e) => setFill(e.currentTarget.value)}
              aria-label="Color del texto"
            />
          </div>

          <div className="flex items-center gap-2">
            <Toggle
              pressed={bold}
              onPressedChange={setBold}
              aria-label="Negrita"
              className="rounded-lg"
            >
              <Bold className="h-4 w-4" />
            </Toggle>

            <Toggle
              pressed={underline}
              onPressedChange={setUnderline}
              aria-label="Subrayado"
              className="rounded-lg"
            >
              <Underline className="h-4 w-4" />
            </Toggle>

            {/* Vista previa rápida (opcional y liviana) */}
            <div className="ml-auto text-sm">
              <span
                style={{
                  color: fill,
                  fontWeight: bold ? 700 : 400,
                  textDecoration: underline ? 'underline' : 'none',
                }}
              >
                Vista previa
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => { setQuickText(''); }}
            >
              Limpiar
            </Button>
            <Button onClick={addQuickText}>Agregar</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="destructive"
        onClick={() => dispatch(EditorEvent.DELETE_SELECTED)}
      >
        Eliminar
      </Button>
    </div>
  );
}
