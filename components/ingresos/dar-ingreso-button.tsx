import { buttonVariants } from "@/components/ui/button";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import { DoorOpen } from "lucide-react";
import Link from "next/link";

interface Props {
  documento: string;
}

export default async function DarIngresoButton({ documento }: Props){
    const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;
    
    const accessResult = await checkOrganizationAccess({ organizationId });
    
    if(!accessResult.authorized){
        return null;
    }
    
    return(
        <Link 
            href={`/registro/${documento}/dar_ingreso`} 
            className={buttonVariants({variant:'dar_ingreso', size:'lg'})}
        >
            <DoorOpen/> Dar Ingreso
        </Link>
    )
}
