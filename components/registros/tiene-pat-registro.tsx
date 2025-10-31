// components/registros/tiene-pat-registro.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { PaseConSolicitante } from "@/lib/database/pat-queries";

type Estado =
  | { kind: "sin_pases" }
  | { kind: "vigente"; venceEnYmd: string }
  | { kind: "vencido"; vencioEnYmd: string };

const TZ = "America/Argentina/Buenos_Aires";

/** HOY como 'YYYY-MM-DD' en zona AR */
function todayYmdInTz(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' */
function formatArYmd(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ymd;
}

/** Comparación léxica de 'YYYY-MM-DD' */
function cmpYmd(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Normaliza string|Date|unknown a 'YYYY-MM-DD' en zona AR */
function toYmd(value: unknown, tz = TZ): string | undefined {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value);
  }
  if (typeof value === "string") {
    // si ya viene como YMD, devolvemos directo
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    }
  }
  return undefined;
}

function resolverEstado(pases: PaseConSolicitante[], hoyYmd = todayYmdInTz(TZ)): Estado {
  if (!pases || pases.length === 0) return { kind: "sin_pases" };

  // normalizamos ambas fechas a YMD
  const norm = pases
    .map((p) => ({
      desde: toYmd(p.fecha_extension as unknown),
      hasta: toYmd(p.fecha_vencimiento as unknown),
    }))
    .filter((r): r is { desde: string; hasta: string } => Boolean(r.desde && r.hasta));

  if (norm.length === 0) return { kind: "sin_pases" };

  // vigente si: desde ≤ hoy ≤ hasta
  const vigentes = norm.filter(
    (r) => cmpYmd(r.desde, hoyYmd) <= 0 && cmpYmd(hoyYmd, r.hasta) <= 0
  );

  if (vigentes.length > 0) {
    const venceEnYmd = vigentes.map((r) => r.hasta).sort((a, b) => cmpYmd(b, a))[0];
    return { kind: "vigente", venceEnYmd };
  }

  // sino, vemos el último vencimiento
  const ultimoVenc = norm.map((r) => r.hasta).sort((a, b) => cmpYmd(b, a))[0];
  if (cmpYmd(ultimoVenc, hoyYmd) < 0) {
    return { kind: "vencido", vencioEnYmd: ultimoVenc };
  }

  // todos futuros
  return { kind: "sin_pases" };
}

export default function PatVencimiento({ pases }: { pases: PaseConSolicitante[] }) {
  const est = resolverEstado(pases);

  if (est.kind === "vigente") {
    const fechaTxt = formatArYmd(est.venceEnYmd);
    return (
      <Card className="bg-emerald-50 p-3 border border-emerald-200 shadow-sm w-fit">
        <CardContent className="p-2">
          <div className="text-sm font-semibold text-emerald-900">TIENE PAT · VENCE:</div>
          <div className="text-lg font-bold text-emerald-900">{fechaTxt}</div>
        </CardContent>
      </Card>
    );
  }

  if (est.kind === "vencido") {
    const fechaTxt = formatArYmd(est.vencioEnYmd);
    return (
      <Card className="bg-rose-50 p-3 border border-rose-200 shadow-sm w-fit">
        <CardContent className="p-2">
          <div className="text-sm font-semibold text-rose-900">ÚLTIMO PAT VENCIDO:</div>
          <div className="text-lg font-bold text-rose-900">{fechaTxt}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-50 p-3 border border-slate-200 shadow-sm w-fit">
      <CardContent className="p-2">
        <div className="text-sm font-semibold text-slate-900">NO TIENE PASES</div>
      </CardContent>
    </Card>
  );
}
