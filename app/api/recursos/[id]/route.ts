import { NextResponse } from "next/server";
import { obtenerRecursoBytes, obtenerThumbBytes } from "@/lib/database/recurso-queries";


export const runtime = "nodejs"; // necesitamos Buffer/crypto

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const url = new URL(_.url);
    const isThumb = url.searchParams.get("thumb") === "1";

    const row = isThumb ? await obtenerThumbBytes(id) : await obtenerRecursoBytes(id);
    if (!row) return new NextResponse("Not found", { status: 404 });

    const headers = new Headers();
    headers.set("Content-Type", row.mime_type);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", `W/\"${row.sha256}\"`);
    headers.set("Content-Length", String(row.datos.byteLength));

    return new NextResponse(row.datos, { status: 200, headers });
}