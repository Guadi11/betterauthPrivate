import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";
import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props { documento: string; }

export default async function DarIngresoButton({ documento }: Props){
  const organizationId = ORGANIZATION_IDS.PERSONAL_ESTABLECIMIENTOS_NAVALES;
  const accessResult = await checkOrganizationAccess({ organizationId });
  if (!accessResult.authorized) return null;

  return (
    <Link
      href={`/registro/${documento}/dar_ingreso`}
      className={cn(
        buttonVariants({ variant: "dar_ingreso", size: "cta" }),
        "overflow-hidden"
      )}
    >
      <DoorOpen aria-hidden="true" />
      <span>Dar Entrada</span>
    </Link>
  );
}
