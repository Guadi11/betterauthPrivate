import { IdCard } from "lucide-react";
import Link from "next/link";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";

interface Props { documento: string; }

export default async function ConfeccionarPATBoton({ documento }: Props){
  const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;
  const accessResult = await checkOrganizationAccess({ organizationId });
  if (!accessResult.authorized) return null;

  return (
    <Link
        href={`/registro/${documento}/confeccionar_pat`}
        className="w-full inline-flex items-center justify-center gap-4
                    rounded-xl bg-purple-600 text-white
                    text-xl md:text-2xl leading-none
                    py-4 px-6 whitespace-nowrap
                    hover:bg-purple-700 transition
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
    >
        <IdCard className="size-10 md:size-12 shrink-0" aria-hidden="true" />
        <span>Confeccionar PAT</span>
    </Link>
  );
}