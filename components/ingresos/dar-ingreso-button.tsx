import { buttonVariants } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";
import Link from "next/link";

interface Props {
  documento: string;
}

export default function DarIngresoButton({ documento }: Props){
    return(
        <Link 
            href={`/registro/${documento}/dar_ingreso`} 
            className={buttonVariants({variant:'dar_ingreso', size:'lg'})}
        >
            <DoorOpen/> Dar Ingreso
        </Link>
    )
}
