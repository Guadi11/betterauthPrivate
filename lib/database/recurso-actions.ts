"use server";
import crypto from "node:crypto";
import sharp from "sharp";
import { SubidaRecursoSchema, RecursoFiltroSchema, MIME_PERMITIDOS } from "@/lib/zod/recurso-schemas";
import type { RecursoRow } from "@/lib/types/recurso";
import {
    listarRecursos as qListar,
    insertarRecurso,
    obtenerRecursoPorSha,
    archivarRecurso as qArchivar,
    vincularRecursoADiseno as qVincular,
    desvincularRecursoDeDiseno as qDesvincular,
    syncRecursosDeDiseno as qSync,
} from "@/lib/database/recurso-queries";

// Helpers seguros
async function fileToBuffer(f: File): Promise<Buffer> {
    const ab = await f.arrayBuffer();
    return Buffer.from(ab);
}

function sha256(buf: Buffer): string {
    return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function listarRecursosAction(input: unknown): Promise<{ items: RecursoRow[]; total: number; }> {
    const filtro = RecursoFiltroSchema.parse(input ?? {});
    return qListar(filtro);
}

export async function subirRecursoAction(formData: FormData): Promise<{ ok: true; recurso: RecursoRow; reusado: boolean } | { ok: false; error: string }>{
    const f = formData.get("file");
    const nombreRaw = formData.get("nombre");
    const nombre = typeof nombreRaw === "string" && nombreRaw.trim().length > 0 ? nombreRaw.trim() : undefined;

    if (!(f instanceof File)) return { ok: false, error: "Archivo no válido" };
    const mime_type = (f.type as typeof MIME_PERMITIDOS[number]) ?? "";
    if (!MIME_PERMITIDOS.includes(mime_type as typeof MIME_PERMITIDOS[number])) {
    return { ok: false, error: "Tipo de archivo no permitido (solo PNG/JPEG)" };
    }

    const datos = await fileToBuffer(f);
    const hash = sha256(datos);

    // ¿Existe ya?
    const existente = await obtenerRecursoPorSha(hash);
    if (existente) {
    return { ok: true, recurso: existente, reusado: true };
    }

    // Extraer dimensiones y miniatura
    let ancho_px = 0; let alto_px = 0; let thumb: Buffer | null = null;
    try {
    const img = sharp(datos);
    const meta = await img.metadata();
    if (!meta.width || !meta.height) 
        return { ok: false, error: "No se pudieron leer dimensiones de la imagen" };
        ancho_px = meta.width;
        alto_px = meta.height;
        thumb = await img.resize({ width: 256, height: 256, fit: "inside" }).png().toBuffer();
    } catch (e) {
        return { ok: false, error: "Imagen inválida o corrupta"+e };
    }

    const valid = SubidaRecursoSchema.safeParse({
        nombre: nombre ?? f.name,
        mime_type,
        bytes_size: datos.byteLength,
        ancho_px,
        alto_px,
        sha256: hash,
    });
    if (!valid.success) return { ok: false, error: valid.error.message };

    const recurso = await insertarRecurso({
    nombre: valid.data.nombre,
    mime_type: valid.data.mime_type,
    sha256: valid.data.sha256,
    bytes_size: valid.data.bytes_size,
    ancho_px: valid.data.ancho_px,
    alto_px: valid.data.alto_px,
    datos,
    thumb_datos: thumb,
    // creado_por: (await pickUserId())
    });

    return { ok: true, recurso, reusado: false };
}

export async function archivarRecursoAction(id: string): Promise<{ ok: true } | { ok: false; error: string; usos?: number }>{
    const r = await qArchivar(id);
    if (!r.ok) {
        if (r.motivo === "en_uso") return { ok: false, error: "El recurso está en uso y no puede archivarse.", usos: r.usos };
        return { ok: false, error: "Recurso inexistente" };
    }
    return { ok: true };
}

export async function vincularRecursoADisenoAction(disenoId: string, recursoId: string): Promise<{ ok: true }>{
    await qVincular(disenoId, recursoId);
    return { ok: true };
}

export async function desvincularRecursoDeDisenoAction(disenoId: string, recursoId: string): Promise<{ ok: true }>{
    await qDesvincular(disenoId, recursoId);
    return { ok: true };
}

export async function syncRecursosDeDisenoAction(disenoId: string, recursoIdsActuales: readonly string[]): Promise<{ ok: true }>{
    await qSync(disenoId, recursoIdsActuales);
    return { ok: true };
}