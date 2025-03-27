import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { NotebookTabs } from "lucide-react";

export default async function IngresosButton(){

    return(
              <Link href="/ingresos" className={buttonVariants({variant: "default-pen", size: "sidenav"})}>
                <NotebookTabs/>Ver Ingresos
              </Link>
    );
}