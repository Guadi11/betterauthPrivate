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
            className="w-full flex items-center justify-center gap-4 rounded-xl bg-green-600 text-white text-2xl py-4 px-6 hover:bg-green-700 transition"
        >
            <DoorOpen size={48}/> Dar Entrada
        </Link>
    )
}
