// lib/auth/server-actions-helpers.ts
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";

export async function assertRolPersonalPases() {
  // 1) Sesión
  const reqHeaders = await headers();                   // ✅ igual que en tu ejemplo
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    throw new Error("No hay sesión activa.");
  }

  // 2) Autorización por organización (PERSONAL_PASES)
  const access = await checkOrganizationAccess({
    organizationId: ORGANIZATION_IDS.PERSONAL_PASES,
  });

  if (!access.authorized) {
    throw new Error("No autorizado: se requiere rol PERSONAL_PASES.");
  }

  const username =
    session.user.username ?? session.user.email ?? "desconocido";

  return { username, user: session.user };
}
