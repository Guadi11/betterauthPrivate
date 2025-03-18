import AccesoDenegado from "@/components/acceso-denegado";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";

export default async function PanelRegistros(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_VINCULACIONES;
        
    const accessResult = await checkOrganizationAccess({ organizationId });
        
    if(!accessResult.authorized){
        return <AccesoDenegado/>;
    }

    return(
        <div>
            <h1>Panel de Administracion de Regsitros</h1>
        </div>
    );
}