import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserOrganizations } from "@/lib/database/organization-queries";

export default async function UserCard(){
        // Obtener los headers de la solicitud antes de usarlos
          const reqHeaders = await headers();
        
          // Llamar a la API de BetterAuth con los headers corregidos
          const session = await auth.api.getSession({ headers: reqHeaders });
        
          if (!session?.user) {
            return <p className="text-gray-600">No hay sesión activa.</p>;
          }
          
          // Obtener las organizaciones del usuario
          const organizations = await getUserOrganizations(session.user.id);
        
          return (
            <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-4 w-full">
              <h2 className="text-xl font-bold mb-2">Sesión Activa</h2>
              <p><strong>Usuario:</strong> {session.user.username}</p>
              {session.user.email && <p><strong>Email:</strong> {session.user.email}</p>}
              {session.user.name && <p><strong>Nombre:</strong> {session.user.name}</p>}
              
              {organizations.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-1">Organizaciones:</h3>
                  <ul className="text-sm">
                    {organizations.map((org) => (
                      <li key={org.id} className="flex items-center py-1">
                        <span>{org.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );}