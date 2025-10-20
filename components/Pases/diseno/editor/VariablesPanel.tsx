// components/Pases/diseno/editor/VariablesPanel.tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Vars } from '@/lib/pat/disenos/editor/vars';

interface Props {
  vars: Vars;
  onChange: (next: Vars) => void;
}
// TODO: Validar si queremos que esto quede en el editor
export default function VariablesPanel({ vars, onChange }: Props) {
  const reg = vars.registro ?? {};
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Variables de prueba (preview)</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Nombre</Label>
          <Input
            placeholder="Nombre"
            value={String(reg.nombre ?? '')}
            onChange={(e) =>
              onChange({
                ...vars,
                registro: { ...reg, nombre: e.currentTarget.value },
              })
            }
          />
        </div>
        <div>
          <Label className="text-xs">Apellido</Label>
          <Input
            placeholder="Apellido"
            value={String(reg.apellido ?? '')}
            onChange={(e) =>
              onChange({
                ...vars,
                registro: { ...reg, apellido: e.currentTarget.value },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
