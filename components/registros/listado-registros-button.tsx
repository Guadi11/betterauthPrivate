import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { BookUser } from "lucide-react";

export default function ListadoRegistrosButton(){
    return(
        <Link href={"/listado_registros"} className={buttonVariants({variant:"default", size:"sidenav"})}>
           <BookUser/> Listado Registros
        </Link>
    );
}