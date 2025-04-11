import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import ConfeccionarPATBoton from "./confeccionar-PAT-boton";
import EditarDiseñoPatBoton from "./editar-diseño-pat-boton";

export default async function BotonesPasesLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_PASES;
    
    const accessResult = await checkOrganizationAccess({ organizationId });
    
    if(!accessResult.authorized){
        return null;
    }

    return (
        <div className="flex-1 space-y-3">
            <ConfeccionarPATBoton/>
            <EditarDiseñoPatBoton/>       
        </div>
    );
}