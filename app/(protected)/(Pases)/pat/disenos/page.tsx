// app/(protected)/(pases)/pat/disenos/page.tsx
import { listarDisenos, type DisenoPat } from "@/lib/database/diseno-pat-queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import RowActions from "./row-actions";

function EstadoBadge({ estado }: { estado: DisenoPat["estado"] }) {
  const variant =
    estado === "publicado" ? "default" :
    estado === "archivado" ? "destructive" : "secondary";
  const label =
    estado === "publicado" ? "Publicado" :
    estado === "archivado" ? "Archivado" : "Borrador";
  return <Badge variant={variant}>{label}</Badge>;
}

function toLocale(dt: string | null | undefined) {
  if (!dt) return "—";
  // Ajusta a tu TZ si tu Date viene en UTC: toLocaleString("es-AR", { ... })
  return new Date(dt).toLocaleString("es-AR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function Page() {
  const disenos = await listarDisenos(); // Promise<DisenoPat[]>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Diseños de PAT</h1>
          <p className="text-sm text-muted-foreground">Gestioná y publicá diseños para la impresión de PAT.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pat/disenos/crear">
            <Button>Nuevo diseño</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>DPI</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disenos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No hay diseños aún. Creá uno con el botón “Nuevo diseño”.
                </TableCell>
              </TableRow>
            ) : disenos.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.nombre}</TableCell>
                <TableCell>{d.ancho_mm}×{d.alto_mm} mm</TableCell>
                <TableCell>{d.dpi_previsualizacion}</TableCell>
                <TableCell><EstadoBadge estado={d.estado} /></TableCell>
                <TableCell>{toLocale((d as any).actualizado_en ?? (d as any).creado_en)}</TableCell>
                <TableCell className="text-right">
                  <RowActions id={d.id} estado={d.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
