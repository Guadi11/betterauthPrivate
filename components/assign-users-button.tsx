"use client";

import { useState } from "react";

// Datos de asignación: cada usuario con su organización correspondiente
const userAssignments = [
  {
    username: "usuariomilitar",
    userId: "bcgkBGxFbVxaJG2jrBA1uxQ59AIQhRUu",
    orgName: "Personal Vinculaciones",
    orgId: "fIVd5L9F3AfiC94NETPaQZvlwqOuZ183",
    role: "admin"
  },
  {
    username: "usuariocivil",
    userId: "OHcOv0H8GUYWkoga295RGZOEuJC17uCb",
    orgName: "Personal Civil",
    orgId: "iHXAGkJhxhZPgHbMnuXDD9iiZW4TDqDu",
    role: "admin"
  },
  {
    username: "usuariopen",
    userId: "hMX8cUFNThv8RsXj9019nRWz87x8SSgY",
    orgName: "Personal Establecimientos Navales",
    orgId: "ibQ6dYjZhckwvZTA2ZqJpmdx1FhoUEgE",
    role: "admin"
  }
];

export default function AddMembersButton() {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Array<{ username: string, status: string, error?: string }>>([]);

  const handleAddMembers = async () => {
    setIsAdding(true);
    setMessage("Asignando usuarios a organizaciones...");
    setResults([]);
    
    const addMemberResults = [];
    
    for (const assignment of userAssignments) {
      try {
        const response = await fetch("/api/add-member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: assignment.userId,
            organizationId: assignment.orgId,
            role: assignment.role
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Error al agregar miembro");
        }
        
        addMemberResults.push({
          username: assignment.username,
          status: "Agregado exitosamente a " + assignment.orgName
        });
      } catch (error: unknown) {
        console.error(`Error al agregar a ${assignment.username}:`, error);
        addMemberResults.push({
          username: assignment.username,
          status: "Error",
          error: error instanceof Error ? error.message : "Error desconocido"
        });
      }
    }
    
    setResults(addMemberResults);
    setMessage("Proceso de asignación completado.");
    setIsAdding(false);
  };

  return (
    <div className="mt-4">
      <button 
        onClick={handleAddMembers}
        disabled={isAdding}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isAdding ? "Asignando..." : "Asignar Usuarios a Organizaciones"}
      </button>
      
      {message && (
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      )}
      
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Resultados:</h3>
          <ul className="list-disc pl-5">
            {results.map((result, index) => (
              <li key={index} className={result.status.includes("Error") ? "text-red-500" : "text-green-500"}>
                {result.username}: {result.status}
                {result.error && <span> - {result.error}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}