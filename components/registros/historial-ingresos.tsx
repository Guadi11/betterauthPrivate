import { IngresoConSolicitante } from "@/lib/database/ingreso-queries";
import { BotonDarSalida } from "../ingresos/registrar-salida-button";

interface Props {
  ingresos: IngresoConSolicitante[] | null;
}

export function HistorialIngresos({ ingresos }: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Ultimos Accessos:</h2>

      {ingresos && ingresos.length > 0 ? (
        <div className="overflow-auto max-h-[36rem] border border-gray-300 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha Ingreso</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha Egreso</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Lugar</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Motivo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tarjeta</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Observación</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Solicitante</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre Solicitante</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Jerarquía</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Destino</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {ingresos.map((ingreso) => (
                <tr key={ingreso.id_ingreso}>
                  <td className="px-4 py-2 text-sm text-gray-900">{new Date(ingreso.fecha_ingreso).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {ingreso.fecha_egreso ? (
                      new Date(ingreso.fecha_egreso).toLocaleString()
                    ) : (
                        <div className="flex flex-col gap-1">
                        <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
                          Actualmente dentro de las instalaciones
                        </span>
                        <BotonDarSalida id_ingreso={ingreso.id_ingreso} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.lugar_visita}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.motivo}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.nro_tarjeta}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.observacion || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {ingreso.tipo_identificador} {ingreso.identificador_solicitante}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.nombre_solicitante}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.jerarquia}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.destino || "—"}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{ingreso.telefono || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Este registro no posee ingresos registrados.</p>
      )}
    </div>
  );
}
