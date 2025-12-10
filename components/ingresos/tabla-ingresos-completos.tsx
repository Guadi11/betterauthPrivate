import Link from "next/link";
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Briefcase 
} from "lucide-react";

import { IngresoCompleto } from "@/lib/database/ingreso-queries";

// Componentes Shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  ingresos: IngresoCompleto[];
}

export default function TablaDeIngresos({ ingresos }: Props) {
  
  // Función auxiliar para formatear fechas consistentemente
  const formatDate = (date: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="mt-6 space-y-4">
      
      {/* --- VISTA MÓVIL (Cards) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {ingresos.map((ingreso) => (
          <Card key={ingreso.id_ingreso} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {ingreso.apellido}, {ingreso.nombre}
                  </CardTitle>
                  <CardDescription>
                    {ingreso.tipo_documento}: {ingreso.documento}
                  </CardDescription>
                </div>
                {/* Badge de Estado */}
                <EstadoBadge fechaEgreso={ingreso.fecha_egreso} />
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3 pt-0">
              <Separator className="my-2" />
              
              {/* Datos Ingreso */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Entrada: <span className="text-foreground font-medium">{formatDate(ingreso.fecha_ingreso)}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{ingreso.lugar_visita}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                   <CreditCard className="h-4 w-4" />
                   <span>Tarjeta: {ingreso.nro_tarjeta}</span>
                </div>
                <div className="text-muted-foreground">
                   <span className="font-semibold text-foreground">Motivo:</span> {ingreso.motivo}
                </div>
              </div>

              <Separator className="my-2" />

              {/* Datos Solicitante */}
              <div className="bg-slate-50 p-2 rounded-md space-y-1">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Solicitado por</p>
                <div className="flex items-center gap-2">
                   <User className="h-3 w-3 text-muted-foreground" />
                   <span>{ingreso.nombre_solicitante}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <Briefcase className="h-3 w-3" />
                   <span>{ingreso.jerarquia} - {ingreso.destino}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/registro/${ingreso.documento}`}>
                    Ver Perfil <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- VISTA DESKTOP (Table) --- */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Datos del Registro</TableHead>
              <TableHead>Detalle del Ingreso</TableHead>
              <TableHead className="w-[300px]">Solicitante</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingresos.map((ingreso) => (
              <TableRow key={ingreso.id_ingreso} className="hover:bg-muted/5">
                
                {/* Columna 1: Registro */}
                <TableCell className="align-top py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-base">
                      {ingreso.apellido}, {ingreso.nombre}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {ingreso.tipo_documento}: {ingreso.documento}
                    </span>
                    <div className="pt-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                            <Link href={`/registro/${ingreso.documento}`}>
                                Acceder
                            </Link>
                        </Button>
                    </div>
                  </div>
                </TableCell>

                {/* Columna 2: Ingreso (Datos apilados) */}
                <TableCell className="align-top py-4 space-y-3">
                  {/* Fechas */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatDate(ingreso.fecha_ingreso)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <EstadoBadge fechaEgreso={ingreso.fecha_egreso} />
                    </div>
                  </div>

                  {/* Ubicación y Tarjeta */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <MapPin className="h-3 w-3" />
                        {ingreso.lugar_visita}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        <CreditCard className="h-3 w-3" />
                        {ingreso.nro_tarjeta}
                    </div>
                  </div>
                  
                  {/* Motivo */}
                  <div className="text-sm">
                    <span className="font-medium text-foreground">Motivo: </span>
                    <span className="text-muted-foreground">{ingreso.motivo}</span>
                  </div>
                  
                  {/* Observación */}
                  {ingreso.observacion && (
                    <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                      <span className="font-semibold">Obs:</span> {ingreso.observacion}
                    </div>
                  )}
                </TableCell>

                {/* Columna 3: Solicitante */}
                <TableCell className="align-top py-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {ingreso.nombre_solicitante}
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                        ID: {ingreso.identificador_solicitante}
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                        {ingreso.jerarquia} - {ingreso.destino}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6 pt-1">
                        <Phone className="h-3 w-3" />
                        {ingreso.telefono}
                    </div>
                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Badge de estado limpio
function EstadoBadge({ fechaEgreso }: { fechaEgreso: Date | null }) {
    if (!fechaEgreso) {
        return (
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">
                Sin egreso
            </Badge>
        );
    }
    
    const fechaStr = new Date(fechaEgreso).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-none font-normal">
            {fechaStr}
        </Badge>
    );
}