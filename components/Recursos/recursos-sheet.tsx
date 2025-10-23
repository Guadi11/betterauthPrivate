// components/Recursos/recursos-sheet.tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listarRecursosAction, subirRecursoAction, vincularRecursoADisenoAction } from "@/lib/database/recurso-actions";
import type { RecursoRow } from "@/lib/types/recurso";
import Image from "next/image";

interface Props {
  disenoId?: string;
  onInsert?: (payload: { url: string; recursoId: string }) => void;
  /** Modo controlado (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Oculta el botón interno para abrir la sheet */
  hideTrigger?: boolean;
}

export default function RecursosSheet({
  disenoId,
  onInsert,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: Props) {
  // soporte controlado / no controlado
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = typeof controlledOpen === "boolean";
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setUncontrolledOpen;

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<RecursoRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, start] = useTransition();

  const cargar = React.useCallback(() => {
    start(async () => {
      const data = await listarRecursosAction({ search, limit: 24, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
    });
  }, [search]);

  React.useEffect(() => { if (open) cargar(); }, [open, cargar]);

  const onSubir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("nombre", file.name);
    start(async () => {
      const r = await subirRecursoAction(fd);
      if (r.ok) cargar();
      else alert(r.error);
    });
  };

  const handleInsert = async (r: RecursoRow) => {
    const url = `/api/recursos/${r.id}`;
    if (disenoId) await vincularRecursoADisenoAction(disenoId, r.id);
    onInsert?.({ url, recursoId: r.id });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button variant="secondary">Recursos</Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-[720px] sm:w-[720px]">
        <SheetHeader>
          <SheetTitle>Recursos</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="globales" className="mt-4">
          <TabsList>
            <TabsTrigger value="globales">Globales ({total})</TabsTrigger>
            <TabsTrigger value="subir">Subir</TabsTrigger>
          </TabsList>

          <TabsContent value="globales" className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && cargar()}
              />
              <Button onClick={cargar} disabled={isLoading}>Buscar</Button>
            </div>

            <ScrollArea className="h-[70vh] pr-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((r) => (
                  <Card key={r.id} className="overflow-hidden">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm truncate" title={r.nombre}>{r.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Image src={`/api/recursos/${r.id}?thumb=1`} alt={r.nombre} className="w-full h-40 object-contain bg-muted" width={r.ancho_px} height={r.alto_px}/>
                    </CardContent>
                    <CardFooter className="p-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.mime_type.replace("image/", "").toUpperCase()} · {r.ancho_px}×{r.alto_px}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleInsert(r)}>Insertar</Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="subir" className="mt-4">
            <div className="space-y-3">
              <Input type="file" accept="image/png,image/jpeg" onChange={onSubir} />
              <p className="text-xs text-muted-foreground">Formatos permitidos: PNG, JPG.</p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
