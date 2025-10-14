// components/Pases/diseno/editor/CanvasToolbar.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { EditorEvent } from '@/lib/pat/disenos/editor/editor-events';

interface Props {
  onPickImage: (file: File) => Promise<void>;
}

export default function CanvasToolbar({ onPickImage }: Props) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const dispatch = (name: (typeof EditorEvent)[keyof typeof EditorEvent], detail?: unknown) =>
    window.dispatchEvent(new CustomEvent(name, { detail }));

  const onChooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) await onPickImage(file);
    if (fileRef.current) fileRef.current.value = '';
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
    </div>
  );
}
