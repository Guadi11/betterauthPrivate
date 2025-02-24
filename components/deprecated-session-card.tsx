"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { UserSession } from "@/types/auth";

export default function SessionCard() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        setSession(data || null);
      } catch (error) {
        console.error("Error al obtener la sesión:", error);
        setSession(null);
      }
    };

    fetchSession();
  }, []);

  if (!session) {
    return <p>No hay sesión activa.</p>;
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
