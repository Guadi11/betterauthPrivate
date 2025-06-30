import DarIngresoButton from "@/components/ingresos/dar-entrada-button";
import DatosDelRegistro from "@/components/registros/datos-del-registro";
import { HistorialIngresos } from "@/components/registros/historial-ingresos";
import FormularioObservacion from "@/components/registros/observacion-registro-form";
import PatVencimiento from "@/components/registros/tiene-pat-registro";
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
    <div>
      <div className="flex">
        <div className="w-full lg:w-1/2">
          <DatosDelRegistro registro={registro}/>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-4 px-6 py-4">
          <FormularioObservacion />
          <div className="flex flex-row gap-4">
            <DarIngresoButton documento={documento} />
            <PatVencimiento />
          </div>
        </div>
      </div>

      <HistorialIngresos ingresos={ingresos} />
    </div>
  );  
}
