import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import RegistrosButton from "./registrar-ingreso-button";
import IngresosButton from "./ver-ingresos-button";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";

export default async function BotonesPENLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;

    const accessResult = await checkOrganizationAccess({ organizationId });

    if(!accessResult.authorized){
        return null;
    }

    return(
        <div>
            <IngresosButton/>
            <RegistrosButton/>
        </div>
    );
}