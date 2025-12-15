// app/(solicitantes)/solicitantes/page.tsx
import { obtenerSolicitantes } from "@/lib/database/solicitante-queries";
import { SolicitantesTable } from "@/components/solicitantes/solicitantes-table"; // Componente cliente que haremos abajo

type SearchParams = Promise<{ q?: string }>;

export default async function SolicitantesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 1. Esperamos la promesa antes de usar sus propiedades
  const params = await searchParams;
  
  // 2. Ahora accedemos de forma segura
  const query = params.q || "";
  
  const solicitantes = await obtenerSolicitantes(query);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Solicitantes</h1>
      </div>
      
      <SolicitantesTable data={solicitantes} />
    </div>
  );
}