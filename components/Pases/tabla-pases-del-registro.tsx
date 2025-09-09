"use client";

import { useMemo } from "react";
import { PaseConSolicitante } from "@/lib/database/pat-queries";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, MoreHorizontal } from "lucide-react";

type Props = {
  data: PaseConSolicitante[];
};

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d =
    value instanceof Date
      ? value
      : new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("es-AR");
}


function esVigente(hastaISO: string | null | undefined) {
  if (!hastaISO) return false;
  const hoy = new Date();
  const fin = new Date(`${hastaISO}T23:59:59`);
  return fin.getTime() >= hoy.getTime();
}

export default function TablaPatsDelRegistro({ data }: Props) {
  const rows = useMemo(() => data ?? [], [data]);

  if (!rows.length) {
    return (
      <div className="text-sm text-muted-foreground py-6">
        No hay pases cargados para este registro.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Listado de Pases de Acceso Transitorio (más recientes primero)</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[72px]">ID</TableHead>
          <TableHead className="min-w-[110px]">N° interno</TableHead>
          <TableHead>Extendido</TableHead>
          <TableHead>Vence</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="min-w-[90px]">Zona</TableHead>
          <TableHead className="min-w-[160px]">Acceso</TableHead>
          <TableHead className="min-w-[260px]">Solicitante</TableHead>
          <TableHead className="text-right w-[120px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((p) => {
          const zona = (p.tipo_zona || "—").toUpperCase();
          const vigente = esVigente(p.fecha_vencimiento);

          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.id}</TableCell>

              <TableCell>
                <span className="font-mono tabular-nums">{p.nro_interno}</span>
              </TableCell>

              <TableCell>{formatDate(p.fecha_extension)}</TableCell>
              <TableCell>{formatDate(p.fecha_vencimiento)}</TableCell>

              <TableCell>
                <Badge variant={vigente ? "default" : "secondary"}>
                  {vigente ? "Vigente" : "Vencido"}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant="outline">{zona}</Badge>
              </TableCell>

              <TableCell className="truncate max-w-[220px]">{p.acceso_pat}</TableCell>

              <TableCell className="space-y-0.5">
                <div className="font-medium leading-none">
                  {p.nombre_solicitante ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground leading-none">
                  ID: <span className="font-mono">{p.identificador_solicitante ?? "—"}</span>
                  {" • "}
                  Jerarquía: {p.jerarquia ?? "—"}
                  {" • "}
                  Destino: {p.destino ?? "—"}
                  {" • "}
                  Tel: {p.telefono ?? "—"}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Abrir acciones">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Placeholder de imprimir */}
                    <DropdownMenuItem
                      onClick={() => {
                        console.log("Imprimir PAT id:", p.id);
                        alert(`Imprimir PAT #${p.id} (placeholder)`);
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
