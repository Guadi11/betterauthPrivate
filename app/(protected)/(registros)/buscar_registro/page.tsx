import Buscador from "@/components/registros/buscador";
import Pagination from "@/components/registros/pagination";
import RegistrosTable from "@/components/registros/tabla-registros-nueva";
import { obtenerPaginasRegistrosFiltrados } from "@/lib/database/registros-queries";

export default async function BuscarRegistroPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}){
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await obtenerPaginasRegistrosFiltrados(query);
    return(
        <>
            <div>
                <h1>Busqueda por DNI, Pasaporte o Nombre.</h1>
                <Buscador placeholder="Ingrese Nombre, Pasaporte o Documento completo"/>
                <RegistrosTable query={query} currentPage={currentPage} />
                <div className="mt-5 flex w-full justify-center">
                    <Pagination totalPages={totalPages} />
                </div>
            </div>
        </>
    );
}