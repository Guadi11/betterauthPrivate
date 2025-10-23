export interface RecursoRow {
    id: string; // bigint -> string
    nombre: string;
    mime_type: "image/png" | "image/jpeg";
    sha256: string; // 64 hex
    bytes_size: number;
    ancho_px: number;
    alto_px: number;
    datos?: never; // Nunca exponer en selects normales
    thumb_datos?: never;
    estado: "activo" | "archivado";
    creado_por: string;
    creado_en: string; // ISO
    usos?: number; // agregado vía view/join
}