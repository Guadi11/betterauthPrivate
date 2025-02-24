import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SessionCard() {
  // Obtener los headers de la solicitud antes de usarlos
  const reqHeaders = await headers();

  // Llamar a la API de BetterAuth con los headers corregidos
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user) {
    return <p className="text-gray-600">No hay sesión activa.</p>;
  }

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-4">
      <h2 className="text-xl font-bold mb-2">Sesión Activa</h2>
      <p><strong>Usuario:</strong> {session.user.username}</p>
      {session.user.email && <p><strong>Email:</strong> {session.user.email}</p>}
      {session.user.name && <p><strong>Nombre:</strong> {session.user.name}</p>}
    </div>
  );
}
