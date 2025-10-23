import { PencilRuler } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function DiseñoPatBoton(){
    return (
        <Link href="/pat/disenos" className={buttonVariants({variant: "default-pat", size: "sidenav"})}>
            <PencilRuler/> Diseños
        </Link>
    );
}