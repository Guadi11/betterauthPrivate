import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function BotonCrearRegistro(){
    return(
        <Link className={buttonVariants({ variant: "default", size: "sidenav" })} href={'/crear_registro'}> 
            <UserPlus /> Crear Registro
        </Link>
    );
}