import { IngresoCompleto } from "@/lib/database/ingreso-queries";

interface Props {
  ingresos: IngresoCompleto[];
}

export default function TablaDeIngresos({ ingresos }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">Datos del Registro</th>
            <th className="px-4 py-2">Datos del Ingreso</th>
            <th className="px-4 py-2">Datos del Solicitante</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-900">
          {ingresos.map((ingreso) => (
            <tr key={ingreso.id_ingreso} className="bg-white">
              <td className="px-4 py-2">
                <div><strong>Apellido y Nombre:</strong> {ingreso.apellido_registro}, {ingreso.nombre_registro}</div>
                <div><strong>Doc.:</strong> {ingreso.tipo_documento_registro} {ingreso.documento}</div>
              </td>
              <td className="px-4 py-2">
                <div><strong>Tarjeta:</strong> {ingreso.nro_tarjeta}</div>
                <div><strong>Ingreso:</strong> {new Date(ingreso.fecha_ingreso).toLocaleString()}</div>
                <div>
                    <strong>Egreso:</strong>{" "}
                    {ingreso.fecha_egreso ? (
                        <span className="text-green-600 font-semibold">
                        {new Date(ingreso.fecha_egreso).toLocaleString()}
                        </span>
                    ) : (
                        <span className="text-red-600 font-semibold">Sin egreso</span>
                    )}
                </div>
                <div><strong>Lugar:</strong> {ingreso.lugar_visita}</div>
                <div><strong>Motivo:</strong> {ingreso.motivo}</div>
                <div><strong>Obs.:</strong> {ingreso.observacion || "—"}</div>
              </td>
              <td className="px-4 py-2">
                <div><strong>ID:</strong> {ingreso.tipo_identificador} {ingreso.identificador_solicitante}</div>
                <div><strong>Nombre:</strong> {ingreso.nombre_solicitante}</div>
                <div><strong>Jerarquía:</strong> {ingreso.jerarquia}</div>
                <div><strong>Destino:</strong> {ingreso.destino}</div>
                <div><strong>Tel.:</strong> {ingreso.telefono}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
