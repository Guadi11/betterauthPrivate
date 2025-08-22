import { IdCard } from "lucide-react";
import Link from "next/link";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props { documento: string; }

export default async function ConfeccionarPATBoton({ documento }: Props){
  const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;
  const accessResult = await checkOrganizationAccess({ organizationId });
  if (!accessResult.authorized) return null;

  return (
    <Link
      href={`/registro/${documento}/confeccionar_pat`}
      className={cn(
        buttonVariants({ variant: "default-pat", size: "cta" }),
        "overflow-hidden"
      )}
    >
      <IdCard aria-hidden="true" />
      <span>Confeccionar PAT</span>
    </Link>
  );
}
