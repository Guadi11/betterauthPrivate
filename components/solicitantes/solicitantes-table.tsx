// app/dashboard/solicitantes/solicitantes-table.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Solicitante } from "@/lib/database/solicitante-queries";
import { SolicitanteDialog } from "@/components/solicitantes/solicitante-dialog";
import { eliminarSolicitanteAction } from "@/lib/database/solicitante-actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Search } from "lucide-react"; // Iconos
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce"; // npm install use-debounce

export function SolicitantesTable({ data }: { data: Solicitante[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estado para el Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSolicitante, setEditingSolicitante] = useState<Solicitante | null>(null);

  // Manejo de búsqueda (debounce para no saturar la DB)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`?${params.toString()}`);
  }, 300);

  // Abrir modal para Crear
  const handleCreate = () => {
    setEditingSolicitante(null);
    setIsDialogOpen(true);
  };

  // Abrir modal para Editar
  const handleEdit = (solicitante: Solicitante) => {
    setEditingSolicitante(solicitante);
    setIsDialogOpen(true);
  };

  // Manejar Eliminación
  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este solicitante?")) return;
    
    const res = await eliminarSolicitanteAction(id);
    if (res.success) {
      toast.success("Solicitante eliminado");
    } else {
      toast.error(res.error || "No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o ID..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("q")?.toString()}
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Solicitante
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Jerarquía</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((sol) => (
                <TableRow key={sol.identificador}>
                  <TableCell className="font-medium">
                    {sol.tipo_identificador} - {sol.identificador}
                  </TableCell>
                  <TableCell>{sol.nombre}</TableCell>
                  <TableCell>{sol.jerarquia}</TableCell>
                  <TableCell>{sol.destino}</TableCell>
                  <TableCell>{sol.telefono}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(sol)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(sol.identificador)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SolicitanteDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        solicitanteAEditar={editingSolicitante}
      />
    </div>
  );
}