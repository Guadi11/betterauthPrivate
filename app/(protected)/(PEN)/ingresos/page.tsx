// app/ingresos/page.tsx
import TablaDeIngresos from "@/components/ingresos/tabla-ingresos-completos";
import { obtenerIngresosFiltrados } from "@/lib/database/ingreso-queries";
import FiltrosIngresos from "@/components/ingresos/filtros-ingresos";
import Paginacion from "@/components/ingresos/paginacion";

interface Props {
  searchParams: Promise<{
    query?: string;
    page?: string;
    estado?: string;
  }>;
}

export default async function IngresosPage(props: Props) {
  const searchParams = await props.searchParams;

  const query = searchParams.query || '';
  const currentPage = Number(searchParams.page) || 1;
  const estado = searchParams.estado === 'abiertos' ? 'abiertos' : 'todos';

  const { data: ingresos, metadata } = await obtenerIngresosFiltrados({
    query,
    page: currentPage,
    estado: estado as 'todos' | 'abiertos',
    limit: 10
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">Listado de Ingresos</h1>
        <p className="text-gray-500 text-sm">
            Gestione el historial de accesos y visitas.
        </p>
      </div>
      <FiltrosIngresos />
      <TablaDeIngresos ingresos={ingresos} />
      <Paginacion totalPages={metadata.totalPages} />
    </main>
  );
}