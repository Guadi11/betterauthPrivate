import { IdCard } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

export default function ConfeccionarPATBoton(){
    return (
        <Link href="/confeccionar_pat" className={buttonVariants({variant: "default-pat", size: "sidenav"})}>
            <IdCard/>Confeccionar PAT
        </Link>
    );
}