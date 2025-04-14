// app/dashboard/page.tsx o donde renderices el dashboard
import RegistroTotalCard from "@/components/dashboard/contador-registros-card";

export default function HomePage() {
  return (
    <main className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <RegistroTotalCard />
        {/* Otras cards que vayas a agregar */}
      </div>
    </main>
  );
}