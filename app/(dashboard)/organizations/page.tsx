import AccesoDenegado from "@/components/acceso-denegado";
import { auth } from "@/lib/auth";
import { getOrganizationMembers, getUserRoleInOrganization, UserOrganization } from "@/lib/database/organization-queries";
import { headers } from "next/headers";

// Al marcar el componente como async, podemos usar await directamente
export default async function Organizations() {
  // Verificar acceso
  const reqHeaders = await headers();

  const session = await auth.api.getSession({headers: reqHeaders});

  // ID de la organización "Personal Vinculaciones"
  const organizationId = "fIVd5L9F3AfiC94NETPaQZvlwqOuZ183";

  // Verificar si el usuario pertenece a la organización "Personal Vinculaciones"
  const userRole = await getUserRoleInOrganization(session.user.id, organizationId);
      
  if (!userRole) {
    //No mostrar la componente
    return(<AccesoDenegado/>);
  }

  // Obtener los datos de la base de datos
  const members: UserOrganization[] = await getOrganizationMembers();
    console.log(members);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tabla de Usuarios y Organizaciones</h1>
      
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Usuario</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Nombre de usuario</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Organización</th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">{member.nombre_usuario}</td>
                <td className="py-3 px-4 text-gray-800">{member.usuario}</td>
                <td className="py-3 px-4 text-gray-800">{member.nombre_organizacion}</td>
                <td className="py-3 px-4 text-gray-800">{member.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {members.length === 0 && (
        <p className="text-center py-4 text-gray-500">No hay usuarios en organizaciones para mostrar.</p>
      )}
    </div>
  );
}