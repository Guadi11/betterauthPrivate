"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Check, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type DisenoOpcion = { id: string; nombre: string };

type Props = {
  patId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function SeleccionarDisenoDialog({ patId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DisenoOpcion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancel = false;
    (async () => {
        try {
        setLoading(true);
        // endpoint nuevo:
        const res = await fetch("/api/disenos?estado=publicado", { cache: "no-store" });
        if (!res.ok) {
            console.error("Fallo GET /api/disenos:", res.status, res.statusText);
            setItems([]); // vaciamos para que se vea "No hay diseños..."
            return;
        }
        const dataUnknown: unknown = await res.json();
        const data = Array.isArray(dataUnknown) ? dataUnknown : [];
        if (!cancel) setItems(
            data
            .map((d: unknown) => {
                if (typeof d !== "object" || d === null) return null;
                const rec = d as Record<string, unknown>;
                const id = typeof rec.id === "string" ? rec.id : null;
                const nombre = typeof rec.nombre === "string" ? rec.nombre : null;
                return id && nombre ? { id, nombre } : null;
            })
            .filter(Boolean) as DisenoOpcion[]
        );
        } finally {
        if (!cancel) setLoading(false);
        }
    })();
    return () => { cancel = true; };
    }, [open]);

  const selected = useMemo(
    () => items.find(x => x.id === selectedId) ?? null,
    [items, selectedId]
  );

  function confirmar() {
    if (!selected) return;
    onOpenChange(false);
    router.push(`/pat/pases/${patId}/imprimir?diseno=${encodeURIComponent(selected.id)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Seleccionar diseño</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Command>
            <CommandInput placeholder="Buscar diseño..." />
            <CommandList>
              <CommandEmpty>
                {loading ? "Cargando..." : "No hay diseños publicados."}
              </CommandEmpty>
              <CommandGroup heading="Diseños publicados">
                {items.map((it) => (
                  <CommandItem
                    key={it.id}
                    value={it.nombre}
                    onSelect={() => setSelectedId(it.id)}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedId === it.id ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{it.nombre}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {selected && (
            <div className="text-xs text-muted-foreground">
              Seleccionado: <span className="font-medium">{selected.nombre}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={confirmar} disabled={!selected}>
            <Printer className="mr-2 h-4 w-4" />
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
