"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true); // Evita clics múltiples
      await authClient.signOut();
      localStorage.removeItem("session"); // Asegurar limpieza
      sessionStorage.clear();
      router.refresh(); // Refrescar la página para actualizar la UI
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button 
      onClick={handleSignOut} 
      disabled={isSigningOut}
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
    >
      {isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
    </button>
  );
}
