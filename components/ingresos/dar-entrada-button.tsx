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
  if (!accessResult.authorized) return null;

  return (
    <Link
      href={`/registro/${documento}/dar_ingreso`}
      className="w-full inline-flex items-center justify-center gap-3
                 rounded-xl bg-green-600 text-white
                 text-lg md:text-xl font-semibold leading-none
                 min-h-16 px-6
                 hover:bg-green-700 transition
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2
                 overflow-hidden whitespace-nowrap"
    >
      <DoorOpen className="w-8 h-8 md:w-8 md:h-8 lg:w-10 lg:h-10 shrink-0" aria-hidden="true" />
      <span>Dar Entrada</span>
    </Link>
  );
}
