import { IngresoCompleto } from "@/lib/database/ingreso-queries";
import Link from "next/link";

interface Props {
  ingresos: IngresoCompleto[];
}

export default function TablaDeIngresos({ ingresos }: Props) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile */}
          <div className="md:hidden">
            {ingresos.map((ingreso) => (
              <div key={ingreso.id_ingreso} className="mb-2 w-full rounded-md bg-white p-4 text-sm">
                <div className="mb-2">
                    <p className="text-base font-semibold">{ingreso.apellido_registro}, {ingreso.nombre_registro}</p>
                    <p className="text-sm text-gray-600">{ingreso.tipo_documento_registro}: {ingreso.documento}</p>
                </div>
                <div className="mb-2">
                  <p><strong>Ingreso:</strong> {new Date(ingreso.fecha_ingreso).toLocaleString()}</p>
                  <p><strong>Egreso:</strong> {ingreso.fecha_egreso ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      {new Date(ingreso.fecha_egreso).toLocaleString()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                      Sin egreso
                    </span>
                  )}</p>
                  <p><strong>Tarjeta:</strong> {ingreso.nro_tarjeta}</p>
                  <p><strong>Lugar:</strong> {ingreso.lugar_visita}</p>
                  <p><strong>Motivo:</strong> {ingreso.motivo}</p>
                  {ingreso.observacion && <p><strong>Observación:</strong> {ingreso.observacion}</p>}
                </div>
                <div>
                  <p><strong>Solicitante:</strong> {ingreso.nombre_solicitante}</p>
                  <p><strong>ID:</strong> {ingreso.tipo_identificador} {ingreso.identificador_solicitante}</p>
                  <p><strong>Jerarquía:</strong> {ingreso.jerarquia}</p>
                  <p><strong>Destino:</strong> {ingreso.destino}</p>
                  <p><strong>Tel.:</strong> {ingreso.telefono}</p>
                </div>
                <div className="mt-3 flex justify-end">
                    <Link
                        href={`/registro/${ingreso.documento}`}
                        className="group relative rounded-md border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Acceder
                    </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <table className="hidden min-w-full text-gray-900 md:table text-sm">
            <thead className="rounded-lg text-left font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Datos del Registro</th>
                <th className="px-3 py-5 font-medium">Datos del Ingreso</th>
                <th className="px-3 py-5 font-medium">Datos del Solicitante</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {ingresos.map((ingreso) => (
                <tr key={ingreso.id_ingreso} className="border-b last:border-none">
                  {/* Registro */}
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="text-base font-semibold">{ingreso.apellido_registro}, {ingreso.nombre_registro}</div>
                    <div className="text-sm text-gray-600">{ingreso.tipo_documento_registro}: {ingreso.documento}</div>
                    <div className="mt-2">
                        <Link
                        href={`/registro/${ingreso.documento}`}
                        className="inline-block rounded-md border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                        Acceder
                        </Link>
                    </div>
                   </td>

                  {/* Ingreso */}
                  <td className="whitespace-nowrap px-3 py-3 space-y-1">
                    <div><strong>Ingreso:</strong> {new Date(ingreso.fecha_ingreso).toLocaleString()}</div>
                    <div className="flex items-center gap-1">
                      <strong>Egreso:</strong>{" "}
                      {ingreso.fecha_egreso ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {new Date(ingreso.fecha_egreso).toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Sin egreso
                        </span>
                      )}
                    </div>
                    <div><strong>Tarjeta:</strong> {ingreso.nro_tarjeta}</div>
                    <div><strong>Lugar:</strong> {ingreso.lugar_visita}</div>
                    <div><strong>Motivo:</strong> {ingreso.motivo}</div>
                    {ingreso.observacion && <div><strong>Obs.:</strong> {ingreso.observacion}</div>}
                  </td>

                  {/* Solicitante */}
                  <td className="whitespace-nowrap px-3 py-3 space-y-1">
                    <div><strong>Solicitante:</strong> {ingreso.nombre_solicitante}</div>
                    <div><strong>ID:</strong> {ingreso.tipo_identificador} {ingreso.identificador_solicitante}</div>
                    <div><strong>Jerarquía:</strong> {ingreso.jerarquia}</div>
                    <div><strong>Destino:</strong> {ingreso.destino}</div>
                    <div><strong>Tel.:</strong> {ingreso.telefono}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
