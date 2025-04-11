import { IdCard } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default function EditarDiseñoPatBoton(){
    return (
        <Link href="/editar_pat" className={buttonVariants({variant: "default-pat", size: "sidenav"})}>
            <IdCard/>Editar Diseño
        </Link>
    );
}