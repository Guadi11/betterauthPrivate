import DarIngresoButton from "@/components/ingresos/dar-ingreso-button";
import DatosDelRegistro from "@/components/registros/datos-del-registro";
import { HistorialIngresos } from "@/components/registros/historial-ingresos";
import { IngresoConSolicitante, obtenerIngresosPorDocumento } from "@/lib/database/ingreso-queries";
import { obtenerRegistroPorDocumento, Registro } from "@/lib/database/registros-queries";

export default async function PaginaRegistro({ params }: { params: { documento: string } }) {
  const { documento } = await params;

  const registro: Registro | null = await obtenerRegistroPorDocumento(documento);

  if (!registro) {
    return <div>No se encontró el registro con el documento {documento}</div>;
  }

  const ingresos : IngresoConSolicitante[] | null = await obtenerIngresosPorDocumento(documento);
  return (
    <>
      <h1>Prueba de Gitlab 2</h1>
      <DatosDelRegistro registro={registro}/>
      
      <DarIngresoButton/>

      <HistorialIngresos ingresos={ingresos} />
    </>
  );  
}
