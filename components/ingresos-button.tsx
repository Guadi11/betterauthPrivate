import { checkOrganizationAccess } from "@/lib/organization-acces";
import Link from "next/link";
import AccesoDenegado from "./acceso-denegado";

export default async function IngresosButton(){
    const organizationId = "ibQ6dYjZhckwvZTA2ZqJpmdx1FhoUEgE"

    const accessResult = await checkOrganizationAccess({ organizationId });

    if(!accessResult.authorized){
        return null;
    }

    return(
              <Link href="/ingresos">
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Ver Ingresos
                </button>
              </Link>
    );
}