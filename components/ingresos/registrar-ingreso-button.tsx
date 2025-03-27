import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { LogIn } from "lucide-react";

export default async function RegistrosButton(){
    return(
        <Link href="/ingresos/registrar" className={buttonVariants({variant : "default-pen" , size: "sidenav"})}>
            <LogIn/> Registrar Ingreso
        </Link>
    );
}