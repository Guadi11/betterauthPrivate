// app/dashboard/page.tsx o donde renderices el dashboard
import IngresosDiaActualCard from "@/components/dashboard/ingresos-dia-actual";
import TotalRegistrosCard from "@/components/dashboard/total-registros-card";

export default function HomePage() {
  return (
    <main className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <TotalRegistrosCard/>
        <IngresosDiaActualCard/>
        {/* Otras cards que vayas a agregar */}
      </div>
    </main>
  );
}