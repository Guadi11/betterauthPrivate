import DarIngresoButton from "@/components/ingresos/dar-entrada-button";
import ConfeccionarPATBoton from "@/components/Pases/confeccionar-PAT-boton";
import DatosDelRegistro from "@/components/registros/datos-del-registro";
import { HistorialIngresos } from "@/components/registros/historial-ingresos";
import FormularioObservacion from "@/components/registros/observacion-registro-form";
import PatVencimiento from "@/components/registros/tiene-pat-registro";
import { IngresoConSolicitante, obtenerIngresosPorDocumento } from "@/lib/database/ingreso-queries";
import { obtenerRegistroPorDocumento, Registro } from "@/lib/database/registros-queries";
import { obtenerPATsPorDocumento, PaseConSolicitante } from "@/lib/database/pat-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TablaPatsDelRegistro from "@/components/Pases/tabla-pases-del-registro";

export default async function PaginaRegistro({
  params,
}: {
  params:  {documento: string }; 
}) {
  const { documento } = await params;
  const registro: Registro | null = await obtenerRegistroPorDocumento(documento);

  if (!registro) {
    return <div>No se encontró el registro con el documento {documento}</div>;
  }

  const ingresos: IngresoConSolicitante[] | null = await obtenerIngresosPorDocumento(documento);

  let pases: PaseConSolicitante[] = [];
  try {
    pases = await obtenerPATsPorDocumento(documento);
  } catch (e) {
    console.error("Error al obtener PATs:", e);
  }

  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 min-w-0">
          <DatosDelRegistro registro={registro} />
        </div>

        <div className="w-full lg:w-1/2 min-w-0 flex flex-col gap-4 px-4 md:px-6 py-4">
          <FormularioObservacion
            documento={registro.documento}
            valorInicial={registro.observacion ? registro.observacion : ""}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            <DarIngresoButton documento={documento} />
            <ConfeccionarPATBoton documento={documento} />
            <PatVencimiento />
          </div>
        </div>
      </div>

      {/* Historial de ingresos */}
      <HistorialIngresos ingresos={ingresos} />

      {/* Tabla de PATs */}
      <div className="mt-6 px-2 md:px-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between gap-2">
              <span>Pases de Acceso Transitorio</span>
              <span className="text-sm font-normal text-muted-foreground">
                Documento: <span className="font-mono">{documento}</span> • {pases.length} registro(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <TablaPatsDelRegistro data={pases} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
