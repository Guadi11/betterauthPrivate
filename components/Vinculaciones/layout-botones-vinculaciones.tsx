import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import OrganizationButton from "@/components/Vinculaciones/organizations-button";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import SignUpButton from "@/components/sign-up";
import PanelRegistrosButton from "@/components/registros/panel-registros-button";

export default async function BotonesVinculacionesLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_VINCULACIONES;
    
    const accessResult = await checkOrganizationAccess({ organizationId });
    
    if(!accessResult.authorized){
        return null;
    }

    return (
        <div className="flex-1 space-y-3">
            <OrganizationButton/>
            <SignUpButton />
            <PanelRegistrosButton/>
        </div>
    );
}