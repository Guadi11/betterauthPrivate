import { buttonVariants } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";
import Link from "next/link";

export default function DarIngresoButton(){
    return(
        <Link href="/dar_ingreso" className={buttonVariants({variant:'dar_ingreso', size:'lg'})}>
            <DoorOpen/> Dar Ingreso
        </Link>
    )
}