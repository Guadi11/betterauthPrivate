"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

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
    <Button 
      variant={'destructive'}
      size={'sidenav'}
      onClick={handleSignOut} 
      disabled={isSigningOut}
    >
      {isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
    </Button>
  );
}
