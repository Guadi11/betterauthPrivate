import { IngresoConSolicitante } from "@/lib/database/ingreso-queries";
import { RegistrarSalidaDialog } from "../ingresos/registrar-salida-dialog"; // Importamos el nuevo componente
import { Badge } from "@/components/ui/badge"; // Asumiendo que tienes Badge de shadcn, sino usa un span con clases

interface Props {
  ingresos: IngresoConSolicitante[] | null;
}

export function HistorialIngresos({ ingresos }: Props) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Historial de Accesos</h2>

      {ingresos && ingresos.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Fecha Ingreso</th>
                  <th className="px-4 py-3">Fecha Egreso / Estado</th>
                  <th className="px-4 py-3">Lugar</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Detalles Solicitante</th>
                  <th className="px-4 py-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id_ingreso} className="hover:bg-muted/5">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                        {new Date(ingreso.fecha_ingreso).toLocaleString()}
                        {ingreso.abierto_por && (
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">
                                Op: {ingreso.abierto_por}
                            </div>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      {ingreso.fecha_egreso ? (
                        <div className="flex flex-col">
                            <span className="font-medium">{new Date(ingreso.fecha_egreso).toLocaleString()}</span>
                            {ingreso.cierre_fuera_de_tiempo && (
                                <Badge variant="outline" className="w-fit mt-1 text-[10px] border-amber-500 text-amber-600 bg-amber-50">
                                    Cierre tardío
                                </Badge>
                            )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 items-start">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-0">
                             En planta
                          </Badge>
                          {/* Aquí usamos el nuevo componente Dialog */}
                          <RegistrarSalidaDialog 
                            id_ingreso={ingreso.id_ingreso} 
                            fecha_ingreso={ingreso.fecha_ingreso} 
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{ingreso.lugar_visita}</td>
                    <td className="px-4 py-3">
                        {ingreso.motivo}
                        {/* Si hubo cierre tardío, mostramos el motivo de cierre también */}
                        {ingreso.motivo_cierre_fuera_de_termino && (
                            <div className="mt-1 p-1.5 bg-gray-50 rounded text-xs text-gray-600 italic border-l-2 border-amber-400">
                                Cierre: {ingreso.motivo_cierre_fuera_de_termino}
                            </div>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{ingreso.nombre_solicitante}</div>
                      <div className="text-xs text-muted-foreground">
                        {ingreso.jerarquia} • {ingreso.destino}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground italic">
                        {ingreso.observacion || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg bg-muted/10 text-muted-foreground">
          No hay registros de ingresos para esta persona.
        </div>
      )}
    </div>
  );
}