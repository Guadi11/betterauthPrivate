import Buscador from "@/components/registros/buscador";
import RegistrosTable from "@/components/registros/tabla-registros-nueva";

export default async function BuscarRegistroPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}){
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    return(
        <>
            <div>
                <h1>Esto es una barra de busqueda</h1>
                <Buscador placeholder="Ingrese Nombre, Documento o Pasaporte"/>
                <RegistrosTable query={query} currentPage={currentPage} />
            </div>
        </>
    );
}