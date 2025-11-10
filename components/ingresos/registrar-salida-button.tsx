'use client';

import { realizarSalida, RealizarSalidaResult } from "@/lib/database/ingreso-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function BotonDarSalida({ id_ingreso }: { id_ingreso: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSalida = () => {
    startTransition(async () => {
      const res: RealizarSalidaResult = await realizarSalida(id_ingreso);

      if (res.success) {
        toast.success("Salida registrada con éxito");
        router.refresh();
      } else {
        // Título + descripción (más legible)
        toast.error("No se pudo registrar la salida", {
          description: res.error,
        });
        // Metadatos útiles para depurar sin mostrarlos al usuario:
        if (res.meta) console.warn("PG meta:", res.meta);
      }
    });
  };

  return (
    <button
      onClick={handleSalida}
      disabled={isPending}
      className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
    >
      {isPending ? "Procesando..." : "Dar Salida"}
    </button>
  );
}
