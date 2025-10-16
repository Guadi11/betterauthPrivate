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

interface Props {
  onPickImage: (file: File) => Promise<void>;
}

export default function CanvasToolbar({ onPickImage }: Props) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [openQuick, setOpenQuick] = React.useState<boolean>(false);
  const [quickText, setQuickText] = React.useState<string>('');

  const dispatch = (name: (typeof EditorEvent)[keyof typeof EditorEvent], detail?: unknown) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const onChooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) await onPickImage(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addQuickText = () => {
    const val = quickText.trim();
    if (val.length === 0) return;
    dispatch(EditorEvent.ADD_TEXT, { text: val });
    setQuickText('');
    setOpenQuick(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={() => dispatch(EditorEvent.ADD_RECT)}>
        Rectángulo
      </Button>

      <Button type="button" variant="secondary" onClick={() => dispatch(EditorEvent.ADD_TEXT)}>
        Texto
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChooseImage}
      />
      <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
        Imagen…
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

      {/* Texto rápido con textarea externo (controlado) */}
      <Popover open={openQuick} onOpenChange={setOpenQuick}>
        <PopoverTrigger asChild>
          <Button type="button" variant="secondary">Texto rápido…</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 space-y-2">
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
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setQuickText('')}>Limpiar</Button>
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
