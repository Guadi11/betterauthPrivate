// app/api/disenos/route.ts
import { NextResponse } from "next/server";
import { listarDisenos } from "@/lib/database/diseno-pat-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Estado = "borrador" | "publicado" | "archivado";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const estadoParam = url.searchParams.get("estado") ?? undefined;

  const estado = (estadoParam === "borrador" || estadoParam === "publicado" || estadoParam === "archivado")
    ? (estadoParam as Estado)
    : undefined;

  const rows = await listarDisenos(estado as unknown as Estado | undefined);
  const data = rows.map(r => ({ id: r.id, nombre: r.nombre }));
  return NextResponse.json(data);
}