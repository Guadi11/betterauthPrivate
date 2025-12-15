// components/solicitantes/solicitante-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { solicitanteSchema } from "@/lib/zod/ingreso-schemas"; // Reutilizamos tu schema
import { guardarSolicitanteAction } from "@/lib/database/solicitante-actions";
import { Solicitante } from "@/lib/database/solicitante-queries";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // O tu librería de toast preferida

interface SolicitanteDialogProps {
  solicitanteAEditar?: Solicitante | null; // Si viene, es modo edición
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SolicitanteDialog({
  solicitanteAEditar,
  open,
  onOpenChange,
}: SolicitanteDialogProps) {
  const [isPending, setIsPending] = useState(false);

  // Inicializamos el formulario
  const form = useForm<z.infer<typeof solicitanteSchema>>({
    resolver: zodResolver(solicitanteSchema),
    defaultValues: {
      identificador: "",
      tipo_identificador: "DNI",
      nombre: "",
      jerarquia: "",
      destino: "",
      telefono: "",
    },
  });

  // Resetear formulario cuando cambia el solicitante a editar o se abre el modal
  useEffect(() => {
    if (solicitanteAEditar) {
      form.reset(solicitanteAEditar);
    } else {
      form.reset({
        identificador: "",
        tipo_identificador: "DNI",
        nombre: "",
        jerarquia: "",
        destino: "",
        telefono: "",
      });
    }
  }, [solicitanteAEditar, open, form]);

  const onSubmit = async (values: z.infer<typeof solicitanteSchema>) => {
    setIsPending(true);
    const esEdicion = !!solicitanteAEditar;

    const res = await guardarSolicitanteAction(values, esEdicion);

    if (res.success) {
      toast.success(esEdicion ? "Solicitante actualizado" : "Solicitante creado");
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {solicitanteAEditar ? "Editar Solicitante" : "Nuevo Solicitante"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo Identificador */}
              <FormField
                control={form.control}
                name="tipo_identificador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="MR">MR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Identificador - READ ONLY si es edición */}
              <FormField
                control={form.control}
                name="identificador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="12345678"
                        // Bloqueamos edición del ID porque es PK
                        disabled={!!solicitanteAEditar} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="JUAN PEREZ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jerarquia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jerarquía</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CPMU" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destino</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SIAG" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2932..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}