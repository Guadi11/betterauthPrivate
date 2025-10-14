// lib/pat/disenos/editor/units.ts

export function mmToPx(mm: number, dpi: number): number {
  return Math.max(1, Math.round((mm / 25.4) * dpi));
}

export function pxToMm(px: number, dpi: number): number {
  if (dpi <= 0) return 0;
  return (px * 25.4) / dpi;
}

export function gridStepPx(stepMm: number, dpi: number): number {
  return Math.max(1, Math.round(mmToPx(stepMm, dpi)));
}
