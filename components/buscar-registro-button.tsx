import { UserSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function BotonBuscarRegistro(){
    return(
        <Link href="/buscar" className={buttonVariants({variant:'default', size:'sidenav'})}>
            <UserSearch/> Buscar Registro
        </Link>
    )
}