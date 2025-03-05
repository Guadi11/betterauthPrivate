"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function CreateOrganizationsButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateOrganizations = async () => {
    setIsCreating(true);
    setMessage("Creando organizaciones...");
    
    try {
      // Definir las organizaciones a crear
      const organizations = [
        {
          name: "Personal Establecimientos Navales",
          slug: "pen",
          logo: undefined // sin logo
        },
        {
          name: "Personal Civil",
          slug: "pc",
          logo: undefined // sin logo
        },
        {
          name: "Personal Vinculaciones",
          slug: "pv",
          logo: undefined // sin logo
        }
      ];
      
      // Crear cada organización
      const results = await Promise.all(
        organizations.map(async (org) => {
          try {
            const result = await authClient.organization.create({
              name: org.name,
              slug: org.slug,
              logo: org.logo
            });
            return { success: true, org, result };
          } catch (error) {
            console.error(`Error al crear ${org.name}:`, error);
            return { success: false, org, error };
          }
        })
      );
      
      // Contar éxitos y fallos
      const successes = results.filter(r => r.success).length;
      const failures = results.filter(r => !r.success).length;
      
      setMessage(`Proceso completado: ${successes} organizaciones creadas, ${failures} fallidas.`);
    } catch (error) {
      console.error("Error al crear organizaciones:", error);
      setMessage("Error al crear organizaciones. Consulta la consola para más detalles.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={handleCreateOrganizations}
        disabled={isCreating}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isCreating ? "Creando..." : "Crear Organizaciones"}
      </button>
      
      {message && (
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}