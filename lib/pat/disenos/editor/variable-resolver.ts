import type { Vars, VariableKey } from './vars';

function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDateDDMMYYYY(isoOrYmd: string): string {
  // Entrada esperada "YYYY-MM-DD" o ISO. Intentamos parsear sin libs.
  const raw = isoOrYmd.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!m) return raw;
  const [, y, mm, dd] = m;
  return `${dd}/${mm}/${y}`;
}

export function resolveVariable(key: VariableKey, vars: Vars, placeholder = '—'): string {
  const reg = vars.registro ?? {};
  const pat = vars.pat ?? {};

  switch (key) {
    case 'nro_interno':
      return String(pat.nro_interno ?? placeholder);

    case 'zona':
      return String(pat.tipo_zona ?? placeholder);

    case 'acceso':
      return String(pat.acceso_pat ?? placeholder);

    case 'apellido_nombre': {
      const ap = reg.apellido ?? '';
      const no = reg.nombre ?? '';
      const full = ap && no ? `${ap}, ${no}` : ap || no || '';
      return full.length > 0 ? toTitleCase(full) : placeholder;
    }

    case 'tipo_documento': {
      // Siglas fijas
      const td = reg.tipo_documento;
      if (td === 'DNI') return 'DNI';
      if (td === 'PAS') return 'PAS';
      return placeholder;
    }

    case 'nro_documento':
      return String(reg.documento ?? placeholder);

    case 'fecha_vencimiento': {
      const fv = pat.fecha_vencimiento;
      return fv ? formatDateDDMMYYYY(fv) : placeholder;
    }

    case 'motivo':
      return String(pat.causa_motivo_pat ?? placeholder);

    case 'codigo_seguridad':
      return String(pat.codigo_de_seguridad ?? placeholder);

    default:
      return placeholder;
  }
}
