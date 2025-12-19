import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function BotonVerSolicitantes(){
    return(
        <Link className={buttonVariants({ variant: "default", size: "sidenav" })} href={'/solicitantes'}> 
            <Users/> Ver Solicitantes
        </Link>
    );
}