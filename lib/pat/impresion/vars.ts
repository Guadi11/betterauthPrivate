// lib/pat/impresion/vars.ts
import type { PatConRegistro } from "@/lib/database/pat-queries";

export type RenderVars = {
  nro_interno: string;
  zona: string;
  apellido_nombre: string;
  tipo_documento: string;
  nro_documento: string;
  acceso: string;
  fecha_vencimiento: string;
  motivo: string;
  codigo_seguridad: string;
};

function mapZona(sigla: string): string {
  switch ((sigla || "").toUpperCase()) {
    case "HN": return "HOSPITAL NAVAL";
    case "ZC": return "ZONA COMÚN";
    case "ZR": return "ZONA RESERVADA";
    case "PS": return "PILETA SUBOFICIALES";
    case "OT": return "OTRO";
    default:   return (sigla || "").toUpperCase();
  }
}

function toUpperSafe(v: unknown): string {
  const s = typeof v === "string" ? v : String(v ?? "");
  return s.toUpperCase();
}

function toDateFromIsoLike(v: unknown): Date | null {
  if (v == null) return null;

  // Si ya es Date, devolvemos fecha local sin hora
  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }

  if (typeof v === "string") {
    // Caso "YYYY-MM-DD" (DATE de Postgres): armar fecha local
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (m) {
      const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
      return new Date(y, mo, d);
    }
    // Otro formato ISO → que lo parsee Date
    const d2 = new Date(v);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }

  // Intento final: stringify y parsear
  const s = String(v);
  const d3 = new Date(s);
  return Number.isNaN(d3.getTime()) ? null : d3;
}

function formatFechaAr(isoLike: unknown): string {
  const d = toDateFromIsoLike(isoLike);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function construirVarsDesdePat(p: PatConRegistro): RenderVars {
  return {
    nro_interno: p.nro_interno ?? "",
    zona: mapZona(p.tipo_zona ?? ""),
    apellido_nombre: toUpperSafe(`${p.registro_apellido ?? ""}, ${p.registro_nombre ?? ""}`.trim()),
    tipo_documento: p.registro_tipo_documento ?? "",
    nro_documento: p.registro_documento ?? "",
    acceso: toUpperSafe(p.acceso_pat ?? ""),
    fecha_vencimiento: formatFechaAr(p.fecha_vencimiento ?? ""),
    motivo: toUpperSafe(p.causa_motivo_pat ?? ""),
    codigo_seguridad: p.codigo_de_seguridad ?? "",
  };
}
