'use server'

import { obtenerSolicitanteConId, Solicitante } from "./solicitante-queries";

export async function verificarSolicitante(identificador:string): Promise<Solicitante | null>{
    const solicitante = await obtenerSolicitanteConId(identificador);
    return solicitante ?? null;
} 