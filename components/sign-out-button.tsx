"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      alert("Sesión cerrada.");
      router.refresh(); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Error al cerrar sesión.");
    }
  };

  return (
    <button 
      onClick={handleSignOut} 
      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
      Cerrar Sesión
    </button>
  );
}