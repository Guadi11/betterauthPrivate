import { headers } from "next/headers";
import AccesoDenegado from "@/components/acceso-denegado";
import { auth } from "./auth";
import { getUserRoleInOrganization } from "./database/organization-queries";

export async function WithOrganizationAcces(
    organizationId: string,
){
      // Verificar acceso
      const reqHeaders = await headers();
    
      const session = await auth.api.getSession({headers: reqHeaders});
    
      // Verificar si el usuario pertenece a la organización "Personal Vinculaciones"
      const userRole = await getUserRoleInOrganization(session.user.id, organizationId);
          
      if (!userRole) {
        //No mostrar la componente
        return <AccesoDenegado/>;
      }
}