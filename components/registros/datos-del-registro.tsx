import { Registro } from "@/lib/database/registros-queries";

interface Props{
    registro: Registro;
}

export default function DatosDelRegistro({ registro }: Props) {
  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Datos del Registro</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b">
          <h2 className="text-3xl font-bold text-gray-900">{registro.nombre} {registro.apellido}</h2>
          <p className="mt-2 text-md text-gray-600">
            {registro.tipo_documento}: <span className="font-medium">{registro.documento}</span>
          </p>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fecha de nacimiento</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {registro.fecha_nacimiento ? new Date(registro.fecha_nacimiento).toLocaleDateString() : "No especificado"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nacionalidad</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.nacionalidad || "No especificado"}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Domicilio Real</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.domicilio_real || "No especificado"}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Domicilio Eventual</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.domicilio_eventual || "No especificado"}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Referido CC</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.referido_cc ? "Sí" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
