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
        <div className="border border-gray-400 rounded-md p-4 w-full max-w-sm bg-white shadow-md">
        <div className="text-center font-bold text-lg border-b mb-2">
            DÍA ACTUAL <span className="ml-2 font-normal">{fechaFormateada}</span>
        </div>

        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
            <span>Ingresos día actual:</span>
            <span className="border px-2 min-w-[40px] text-right">—</span>
            </div>
            <div className="flex justify-between">
            <span>Ingresos de ayer {fechaAyer}:</span>
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
        </div>

        </div>
    );
}
