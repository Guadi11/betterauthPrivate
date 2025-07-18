import { Registro } from "@/lib/database/registros-queries";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface Props{
    registro: Registro;
}

export default function DatosDelRegistro({ registro }: Props) {
  return (
    <div className="w-full">

      <div className="bg-white shadow overflow-visible sm:rounded-lg">
        
        <div className="px-4 py-5 sm:px-6 border-b flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{registro.nombre} {registro.apellido}</h2>
            <p className="mt-2 text-md text-gray-600">
              {registro.tipo_documento}: <span className="font-medium">{registro.documento}</span>
            </p>
          </div>
          <Link
            href={`/registro/${registro.documento}/editar`}
            className="group relative rounded-md border p-2 hover:bg-gray-100"
          >
            <Pencil className="h-5 w-5 text-gray-500" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
              Editar
            </span>
          </Link>
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
              <dt className="text-sm font-medium text-gray-500">Observacion CC</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{registro.observacion_cc ? "Sí" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
