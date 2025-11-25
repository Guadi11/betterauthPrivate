'use client';

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInHours, parseISO } from "date-fns"; // Necesitarás: npm install date-fns
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";

import { realizarSalida } from "@/lib/database/ingreso-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Schema de validación local
const salidaFormSchema = z.object({
  fecha_egreso: z.string().refine((val) => val !== "", "La fecha es requerida"),
  motivo: z.string().optional(),
});

interface Props {
  id_ingreso: number;
  fecha_ingreso: string | Date; // Recibimos la fecha de ingreso para calcular diferencia
}

export function RegistrarSalidaDialog({ id_ingreso, fecha_ingreso }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Convertir fecha_ingreso a objeto Date seguro
  const fechaIngresoDate = typeof fecha_ingreso === 'string' ? parseISO(fecha_ingreso) : fecha_ingreso;

  const form = useForm<z.infer<typeof salidaFormSchema>>({
    resolver: zodResolver(salidaFormSchema),
    defaultValues: {
      // Formato compatible con input type="datetime-local": YYYY-MM-DDTHH:mm
      fecha_egreso: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      motivo: "",
    },
  });

  // Observar fecha de egreso para calcular si pasaron 24hs
  const fechaEgresoWatch = form.watch("fecha_egreso");
  const [excede24hs, setExcede24hs] = useState(false);

  useEffect(() => {
      // 1. Calculamos si la "Visita" dura más de 24h (según lo que el usuario escribe)
      let visitaLarga = false;
      if (fechaEgresoWatch) {
        const fechaEgresoDate = new Date(fechaEgresoWatch);
        visitaLarga = differenceInHours(fechaEgresoDate, fechaIngresoDate) >= 24;
      }

      // 2. Calculamos si es un "Olvido Administrativo" (Hoy vs Ingreso > 24h)
      // Usamos new Date() para el momento actual
      const olvidoAdministrativo = differenceInHours(new Date(), fechaIngresoDate) >= 24;

      // Si cualquiera de los dos ocurre, exigimos motivo
      setExcede24hs(visitaLarga || olvidoAdministrativo);

    }, [fechaEgresoWatch, fechaIngresoDate])

  async function onSubmit(values: z.infer<typeof salidaFormSchema>) {
    // Validación extra: Si excede 24hs, motivo es obligatorio
    if (excede24hs && (!values.motivo || values.motivo.trim().length < 10)) {
      form.setError("motivo", { 
        type: "manual", 
        message: "La justificación es obligatoria y debe tener al menos 10 caracteres para cierres > 24hs." 
      });
      return;
    }

    startTransition(async () => {
      const res = await realizarSalida({
        id_ingreso,
        fecha_egreso: new Date(values.fecha_egreso),
        motivo: values.motivo,
      });

      if (res.success) {
        toast.success("Salida registrada correctamente");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Error al registrar salida", {
          description: res.error,
        });
        
        // Si el error venía del backend (por concurrencia o bypass), forzamos mostrar el campo
        if (res.code === 'REQUIERE_MOTIVO_CIERRE') {
            setExcede24hs(true);
            form.setError("motivo", { message: res.error });
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <LogOut className="h-4 w-4" />
          Dar Salida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>
            Confirme la fecha y hora de egreso de la visita.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo Fecha Egreso */}
            <FormField
              control={form.control}
              name="fecha_egreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de Egreso</FormLabel>
                  <FormControl>
                    <Input 
                        type="datetime-local" 
                        {...field} 
                        max={format(new Date(), "yyyy-MM-dd'T'HH:mm")} // No permitir futuro
                    />
                  </FormControl>
                  <FormDescription>
                    Ingreso: {format(fechaIngresoDate, "dd/MM/yyyy HH:mm")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Motivo (Condicional visualmente, pero validado lógicamente) */}
            {excede24hs && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md space-y-3 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 text-amber-700">
                    <span className="text-sm font-semibold">⚠️ Cierre fuera de término (+24h)</span>
                </div>
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-800">Motivo / Justificación</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describa por qué el cierre se realiza después de 24hs..." 
                          className="resize-none bg-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Salida
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}