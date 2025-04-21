'use client';

import { realizarSalida } from "@/lib/database/ingreso-actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function BotonDarSalida({ id_ingreso }: { id_ingreso: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSalida = () => {
    startTransition(async () => {
      const res = await realizarSalida(id_ingreso);
      if (res.success) {
        console.log("¡Salida registrada con éxito!");
        router.refresh(); // refresca los datos del servidor
      } else {
        console.log(res.error || "Error al registrar la salida");
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
