import AccesoDenegado from "@/components/acceso-denegado";
import { getOrganizationMembers, UserOrganization } from "@/lib/database/organization-queries";
import { checkOrganizationAccess } from "@/lib/organization/organization-acces";
import { ORGANIZATION_IDS } from "@/lib/organization/organization-ids";

// Al marcar el componente como async, podemos usar await directamente
export default async function Organizations() {
  // Verificar acceso
   const organizationId = ORGANIZATION_IDS.PERSONAL_VINCULACIONES;
   const accessResult = await checkOrganizationAccess({organizationId});
  if (!accessResult.authorized) {
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