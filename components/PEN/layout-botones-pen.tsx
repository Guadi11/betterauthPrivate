import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import IngresosButton from "@/components/ingresos/ver-ingresos-button";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";

export default async function BotonesPENLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;

    const accessResult = await checkOrganizationAccess({ organizationId });

    if(!accessResult.authorized){
        return null;
    }

    return(
        <div className="flex-1 space-y-3">
            <IngresosButton/>
        </div>
    );
}