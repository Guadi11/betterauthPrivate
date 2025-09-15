// app/(protected)/(pases)/pat/disenos/row-actions.tsx
"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  publicarDisenoPatAction,
  archivarDisenoPatAction,
} from "@/lib/database/diseno-pat-actions";

type Props = {
  id: number;
  estado: "borrador" | "publicado" | "archivado";
};

export default function RowActions({ id, estado }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onPublicar = () =>
    start(async () => {
      try {
        await publicarDisenoPatAction(id);
        toast.success("Diseño publicado");
        router.refresh();
      } catch (e) {
        console.error(e);
        toast.error("No se pudo publicar el diseño");
      }
    });

  const onArchivar = () =>
    start(async () => {
      try {
        await archivarDisenoPatAction(id);
        toast.success("Diseño archivado");
        router.refresh();
      } catch (e) {
        console.error(e);
        toast.error("No se pudo archivar el diseño");
      }
    });

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/pat/disenos/${id}/editar`}>
        <Button variant="outline" size="sm" disabled={pending}>Editar</Button>
      </Link>

      {estado !== "publicado" && (
        <Button size="sm" onClick={onPublicar} disabled={pending}>
          {pending ? "..." : "Publicar"}
        </Button>
      )}

      {estado !== "archivado" && (
        <Button variant="destructive" size="sm" onClick={onArchivar} disabled={pending}>
          {pending ? "..." : "Archivar"}
        </Button>
      )}
    </div>
  );
}
