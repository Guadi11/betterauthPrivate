// app/(protected)/(Pases)/pat/disenos/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { listarDisenos } from '@/lib/database/diseno-pat-queries';
import { type DisenoPatListItem } from '@/lib/pat/disenos/diseno-pat-types';
import RowActions from './row-actions';

function statusToBadgeVariant(
  estado: DisenoPatListItem['estado'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (estado) {
    case 'publicado':
      return 'default';
    case 'borrador':
      return 'secondary';
    case 'archivado':
      return 'outline';
    default:
      return 'secondary';
  }
}

function formatSizeMM(w: number, h: number): string {
  return `${w} x ${h} mm`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

export default async function Page() {
  const disenos: DisenoPatListItem[] = await listarDisenos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Diseños de PAT</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná y publicá diseños para la impresión de PAT.
          </p>
        </div>
        <Button asChild>
          <Link href="/pat/disenos/crear">Nuevo diseño</Link>
        </Button>
      </div>

      <div className="rounded-md border">
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
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay diseños aún. Creá uno con “Nuevo diseño”.
                </TableCell>
              </TableRow>
            ) : (
              disenos.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>{formatSizeMM(d.ancho_mm, d.alto_mm)}</TableCell>
                  <TableCell>{d.dpi_previsualizacion}</TableCell>
                  <TableCell>
                    <Badge variant={statusToBadgeVariant(d.estado)}>
                      {d.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(d.actualizado_en)}</TableCell>
                  <TableCell className="text-right">
                    <RowActions id={d.id} estado={d.estado} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
