import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserRoleInOrganization } from "@/lib/database/organization-queries";

interface AuthorizationOptions {
  organizationId: string;
  requiredRoles?: string[];
}

export async function checkOrganizationAccess(options: AuthorizationOptions) {
  try {
    // Obtener sesión
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });

    // Verificar rol en la organización
    const userRole = await getUserRoleInOrganization(session.user.id, options.organizationId);

    // Si no tiene rol, no tiene acceso
    if (!userRole) {
      return { 
        authorized: false, 
        reason: "No pertenece a la organización" 
      };
    }

    // Si se especifican roles requeridos, verificar
    if (options.requiredRoles && !options.requiredRoles.includes(userRole)) {
      return { 
        authorized: false, 
        reason: "Rol insuficiente" 
      };
    }

    return { 
      authorized: true, 
      user: session.user,
      role: userRole 
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { 
      authorized: false, 
      reason: "Error de autenticación" 
    };
  }
}