import TablaDeIngresos from "@/components/ingresos/tabla-ingresos-completos";
import { IngresoCompleto, obtenerIngresosCompletos } from "@/lib/database/ingreso-queries";



export default async function Ingresos(){
    const ingresos: IngresoCompleto[] = await obtenerIngresosCompletos();
    
    return(
        <main className="p-6">
            <h1 className="text-3xl font-bold mb-6">Listado de Ingresos</h1>
            <TablaDeIngresos ingresos={ingresos} />
        </main> 
    );
}