import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IngresosDiaActualCard() {
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
        <div className="flex justify-between">
          <span>Ingresos día actual:</span>
          <span className="border px-2 min-w-[40px] text-right">—</span>
        </div>
        <div className="flex justify-between">
          <span>Ingresos {fechaAyer}:</span>
          <span className="border px-2 min-w-[40px] text-right">—</span>
        </div>
        <div className="flex justify-between">
          <span>Ingresos totales:</span>
          <span className="border px-2 min-w-[40px] text-right">—</span>
        </div>
        <div className="flex justify-between">
          <span>Ingresos ZR día ac.:</span>
          <span className="border px-2 min-w-[40px] bg-yellow-100 text-right">—</span>
        </div>
      </CardContent>
    </Card>
  );
}
