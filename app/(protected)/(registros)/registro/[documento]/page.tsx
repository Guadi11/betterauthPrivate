import { Ingreso, obtenerIngresosPorDocumento } from "@/lib/database/ingreso-queries";
import { obtenerRegistroPorDocumento, Registro } from "@/lib/database/registros-queries";

export default async function PaginaRegistro({ params }: { params: { documento: string } }) {
  const { documento } = await params;

  const registro: Registro | null = await obtenerRegistroPorDocumento(documento);

  if (!registro) {
    return <div>No se encontró el registro con el documento {documento}</div>;
  }

  const ingresos : Ingreso[] | null = await obtenerIngresosPorDocumento(documento);
  console.log(ingresos);
  return (<>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Datos del Registro</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Documento: {registro.documento}</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tipo de Documento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.tipo_documento}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nombre</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.nombre}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Apellido</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.apellido}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de nacimiento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {registro.fecha_nacimiento ? new Date(registro.fecha_nacimiento).toLocaleDateString() : "No especificado"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nacionalidad</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.nacionalidad || "No especificado"}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Domicilio Real</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.domicilio_real || "No especificado"}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Domicilio Eventual</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.domicilio_eventual || "No especificado"}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Referido CC</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.referido_cc ? "Sí" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">Historial de Ingresos</h2>

    {ingresos && ingresos.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha Egreso</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Lugar</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Motivo</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tarjeta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {ingresos.map((ingreso) => (
              <tr key={ingreso.id_ingreso}>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {new Date(ingreso.fecha_ingreso).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {ingreso.fecha_egreso
                    ? new Date(ingreso.fecha_egreso).toLocaleString()
                    : "Actualmente dentro de las instalaciones"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{ingreso.lugar_visita}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{ingreso.motivo}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{ingreso.nro_tarjeta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-600">Este registro no posee ingresos registrados.</p>
    )}
  </div>


</>
  );  
}
