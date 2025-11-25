import { IngresoConSolicitante } from "@/lib/database/ingreso-queries";
import { RegistrarSalidaDialog } from "@/components/ingresos/registrar-salida-dialog";
import { Badge } from "@/components/ui/badge";
import { Phone, CreditCard, MapPin, AlertCircle, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  ingresos: IngresoConSolicitante[] | null;
}

export function HistorialIngresos({ ingresos }: Props) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        Historial de Accesos
        {ingresos && ingresos.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {ingresos.length}
          </span>
        )}
      </h2>

      {ingresos && ingresos.length > 0 ? (
        <div className="rounded-md border border-border bg-background shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                <tr>
                  {/* COLUMNA 1: INGRESO */}
                  <th className="px-4 py-3 min-w-[140px]">Ingreso</th>
                  
                  {/* COLUMNA 2: EGRESO (NUEVA) */}
                  <th className="px-4 py-3 min-w-[160px]">Egreso / Estado</th>
                  
                  <th className="px-4 py-3">Visita / Motivo</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Tarjeta</th>
                  <th className="px-4 py-3 max-w-[200px]">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id_ingreso} className="hover:bg-muted/5 transition-colors">
                    
                    {/* --- COLUMNA 1: DATOS DE INGRESO --- */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-mono text-foreground font-medium">
                          {new Date(ingreso.fecha_ingreso).toLocaleString()}
                        </div>
                        {ingreso.abierto_por && (
                            <div className="text-[10px] text-muted-foreground/70 flex items-center gap-1" title={`Operador ID: ${ingreso.abierto_por}`}>
                                <User className="w-3 h-3" /> 
                                Op: {ingreso.abierto_por.slice(0, 8)}...
                            </div>
                        )}
                      </div>
                    </td>

                    {/* --- COLUMNA 2: DATOS DE EGRESO O ACCIÓN --- */}
                    <td className="px-4 py-3 align-top">
                        {!ingreso.fecha_egreso ? (
                          // CASO: ABIERTO (En planta)
                          <div className="flex flex-col gap-2 items-start">
                             <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 shadow-none">
                              En planta
                            </Badge>
                            <RegistrarSalidaDialog 
                              id_ingreso={ingreso.id_ingreso} 
                              fecha_ingreso={ingreso.fecha_ingreso} 
                            />
                          </div>
                        ) : (
                          // CASO: CERRADO
                          <div className="flex flex-col gap-1">
                            <div className="font-mono text-foreground font-medium">
                                {new Date(ingreso.fecha_egreso).toLocaleString()}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                                {/* Badge básico de finalizado */}
                                {!ingreso.cierre_fuera_de_tiempo && (
                                     <Badge variant="outline" className="text-gray-500 border-gray-200 text-[10px] h-5">
                                        Finalizado
                                     </Badge>
                                )}

                                {/* Badge de Cierre Tardío */}
                                {ingreso.cierre_fuera_de_tiempo && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                         <Badge variant="destructive" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 shadow-none gap-1 px-1.5 h-5">
                                          <AlertCircle className="w-3 h-3" />
                                          Tardío
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-amber-950 text-white border-none">
                                        <p className="font-semibold">Motivo:</p>
                                        <p className="text-xs opacity-90">{ingreso.motivo_cierre_fuera_de_termino}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                            </div>
                          </div>
                        )}
                    </td>

                    {/* --- COLUMNA 3: VISITA --- */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {ingreso.lugar_visita}
                        </div>
                        <span className="text-muted-foreground pl-5 text-xs">
                          {ingreso.motivo}
                        </span>
                        
                        {/* Mostramos el motivo de cierre tardío aquí también si prefieres, o lo dejamos solo en el tooltip */}
                        {ingreso.motivo_cierre_fuera_de_termino && (
                             <div className="mt-1 ml-5 p-1.5 bg-amber-50/50 rounded text-[10px] text-amber-800 italic border-l-2 border-amber-300">
                                Cierre: {ingreso.motivo_cierre_fuera_de_termino}
                            </div>
                        )}
                      </div>
                    </td>

                    {/* --- COLUMNA 4: SOLICITANTE --- */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-1">
                        <div>
                            <span className="font-medium text-foreground block">{ingreso.nombre_solicitante}</span>
                            <span className="text-xs text-muted-foreground">
                            {ingreso.jerarquia} • {ingreso.destino}
                            </span>
                        </div>
                        {ingreso.telefono && (
                           <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 w-fit px-2 py-0.5 rounded-full border border-blue-100 font-mono">
                             <Phone className="w-3 h-3" />
                             {ingreso.telefono}
                           </div>
                        )}
                      </div>
                    </td>

                    {/* --- COLUMNA 5: TARJETA --- */}
                    <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 w-fit font-mono text-xs">
                            <CreditCard className="w-3 h-3" />
                            {ingreso.nro_tarjeta}
                        </div>
                    </td>

                    {/* --- COLUMNA 6: OBSERVACIÓN --- */}
                    <td className="px-4 py-3 align-top text-muted-foreground italic text-xs max-w-[200px]">
                        {ingreso.observacion ? (
                             <span title={ingreso.observacion} className="line-clamp-3">{ingreso.observacion}</span>
                        ) : (
                            <span className="opacity-30">—</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-muted/10 text-muted-foreground gap-2">
          <p>No hay registros de ingresos para esta persona.</p>
        </div>
      )}
    </div>
  );
}