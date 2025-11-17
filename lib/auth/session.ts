// lib/auth-session.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ServerSession = typeof auth.$Infer.Session;
export type ServerUser = ServerSession["user"];

export async function getServerSession(): Promise<ServerSession | null> {
  // Lee la sesión actual usando las cookies de la request
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getOptionalUser(): Promise<ServerUser | null> {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Lanza error si no hay usuario autenticado.
 * Útil en server actions dentro de (protected).
 */
export async function requireUser(): Promise<ServerUser> {
  const user = await getOptionalUser();
  if (!user) {
    throw new Error("Usuario no autenticado.");
  }
  return user;
}

/**
 * Devuelve sólo el id del usuario (string).
 * Lanza error si no hay sesión.
 */
export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}

/**
 * Versión "blanda": devuelve null si no hay sesión.
 */
export async function getUserIdOrNull(): Promise<string | null> {
  const user = await getOptionalUser();
  return user?.id ?? null;
}
