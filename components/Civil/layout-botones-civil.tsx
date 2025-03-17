import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import ConfeccionarPATBoton from "./confeccionar-PAT-boton";

export default async function BotonesCivilLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_CIVIL;
    
    const accessResult = await checkOrganizationAccess({ organizationId });
    
    if(!accessResult.authorized){
        return null;
    }

    return (
        <div>
            <ConfeccionarPATBoton/>            
        </div>
    );
}