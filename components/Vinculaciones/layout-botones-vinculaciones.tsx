import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import OrganizationButton from "./organizations-button";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import SignUpButton from "@/components/sign-up";

export default async function BotonesVinculacionesLayout(){
    const organizationId = ORGANIZATION_IDS.PERSONAL_VINCULACIONES;
    
    const accessResult = await checkOrganizationAccess({ organizationId });
    
    if(!accessResult.authorized){
        return null;
    }

    return (
        <div>
            <OrganizationButton/>
            <SignUpButton />
            
        </div>
    );
}