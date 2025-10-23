// components/Pases/diseno/editor/GridControls.tsx
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
  stepMm: number;
  snapEnabled: boolean;
  onChange: (next: { stepMm?: number; snapEnabled?: boolean }) => void;
}

export default function GridControls({ stepMm, snapEnabled, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 items-end">
      <div>
        <Label htmlFor="grid-step">Paso de grilla (mm)</Label>
        <Input
          id="grid-step"
          type="number"
          min={0.25}
          step={0.25}
          value={stepMm}
          onChange={(e) => {
            const v = Number(e.currentTarget.value);
            if (Number.isFinite(v) && v > 0) onChange({ stepMm: v });
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="snap-enabled"
          checked={snapEnabled}
          onCheckedChange={(v: boolean) => onChange({ snapEnabled: v })}
        />
        <Label htmlFor="snap-enabled">Snap a grilla (Shift invierte)</Label>
      </div>
    </div>
  );
}
