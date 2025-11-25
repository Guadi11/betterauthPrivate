import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { obtenerEstadisticasDashboard } from "@/lib/database/ingreso-queries";

// Al ser una función async por defecto en Next.js App Router, es un Server Component.
// Esto significa que la data se busca en el servidor antes de enviar el HTML al cliente.
export default async function IngresosDiaActualCard() {
  // 1. Obtener datos reales de la BD
  const stats = await obtenerEstadisticasDashboard();

  // 2. Lógica de fechas para mostrar en texto (igual a como lo tenías)
  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  const fechaAyer = ayer.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Card className="max-w-sm w-full shadow-md">
      <CardHeader className="text-center border-b pb-2">
        <CardTitle className="text-lg font-bold">
          DÍA ACTUAL <span className="ml-2 font-normal">{fechaFormateada}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm pt-4">
        <div className="flex justify-between items-center">
          <span>Ingresos día actual:</span>
          <span className="border px-2 min-w-[40px] text-right font-medium">
            {stats.ingresos_hoy}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Ingresos {fechaAyer}:</span>
          <span className="border px-2 min-w-[40px] text-right text-muted-foreground">
            {stats.ingresos_ayer}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Ingresos totales:</span>
          <span className="border px-2 min-w-[40px] text-right text-muted-foreground">
            {stats.ingresos_totales}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Ingresos ZR día ac.:</span>
          {/* Mostramos 0 o el número, y cambiamos el color si hay alertas ZR si lo deseas */}
          <span className={`border px-2 min-w-[40px] text-right font-medium ${stats.ingresos_zr_hoy > 0 ? 'bg-yellow-100 text-yellow-800' : ''}`}>
            {stats.ingresos_zr_hoy}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}