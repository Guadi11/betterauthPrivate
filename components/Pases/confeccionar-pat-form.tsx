"use client";

import { useMemo, useTransition } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // <--- Importante
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Importamos tu componente reutilizable
import SolicitanteSection from "@/components/solicitantes/seleccion-solicitante";

// Importamos el Schema y el Tipo
import { ConfeccionarPatSchema, ConfeccionarPatFormData } from "@/lib/zod/pat-schemas";

// Definimos el tipo de duración para el helper (UI Logic)
type TipoDuracion = "1_mes" | "59_dias" | "3_meses" | "6_meses" | "fin_anio" | "1_anio" | "3_anios";

interface Props {
  documento: string;
  // Actualizamos la firma de onSubmit para que coincida con la nueva action
  onSubmit: (documento: string, values: ConfeccionarPatFormData) => Promise<{ ok: boolean; message?: string; field?: string }>;
}

export default function ConfeccionarPatForm({ documento, onSubmit }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Inicializamos el formulario con el Resolver de Zod
  const methods = useForm<ConfeccionarPatFormData>({
    resolver: zodResolver(ConfeccionarPatSchema), // <--- La clave
    defaultValues: {
      pat: {
        fecha_extension: today,
        fecha_vencimiento: "",
        tipo_zona: "ZC",
        acceso_pat: "",
        nro_interno: "",
        causa_motivo_pat: "",
      },
      solicitante: {
        tipo_identificador: "MR",
        identificador: "",
        nombre: "",
        jerarquia: "",
        destino: "",
        telefono: "",
      },
    },
    mode: "onChange", // Valida mientras el usuario escribe (opcional, o "onBlur")
  });

  // Helper para cálculo de fechas (UI Logic solamente)
  const fechaExtension = useWatch({ control: methods.control, name: "pat.fecha_extension" });

  const handleDuracionChange = (value: string) => {
    if (!fechaExtension) {
      toast.warning("Seleccione primero una fecha de extensión");
      return;
    }
    const d = new Date(`${fechaExtension}T00:00:00`);
    
    switch (value as TipoDuracion) {
      case "1_mes": d.setMonth(d.getMonth() + 1); break;
      case "59_dias": d.setDate(d.getDate() + 59); break;
      case "3_meses": d.setMonth(d.getMonth() + 3); break;
      case "6_meses": d.setMonth(d.getMonth() + 6); break;
      case "fin_anio": d.setMonth(11); d.setDate(31); break;
      case "1_anio": d.setFullYear(d.getFullYear() + 1); break;
      case "3_anios": d.setFullYear(d.getFullYear() + 3); break;
    }

    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const fechaCalc = `${d.getFullYear()}-${m}-${day}`;

    // Seteamos el valor. Zod validará si es correcta al momento.
    methods.setValue("pat.fecha_vencimiento", fechaCalc, { shouldValidate: true });
  };

  const onValidSubmit = (values: ConfeccionarPatFormData) => {
    startTransition(async () => {
      const res = await onSubmit(documento, values);
      
      if (!res.ok) {
        if (res.field) {
            // Si el error viene de un campo específico (ej: unique constraint)
            // @ts-expect-error: path string dinámico
            methods.setError(res.field, { message: res.message });
        } else {
            toast.error(res.message || "Error al guardar");
        }
        return;
      }

      toast.success("PAT confeccionado correctamente.");
      router.push(`/registro/${encodeURIComponent(documento)}`);
      router.refresh();
    });
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onValidSubmit)} className="space-y-6">
          
          <div className="rounded-lg border p-4 bg-muted/20">
            <p className="text-sm font-medium">Documento del registro: <span className="text-foreground">{documento}</span></p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Fecha Extensión */}
            <FormField
              control={methods.control}
              name="pat.fecha_extension"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de extensión <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha Vencimiento + Calculadora */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className={methods.formState.errors.pat?.fecha_vencimiento ? "text-destructive" : ""}>
                   Fecha de vencimiento <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={handleDuracionChange}>
                    <SelectTrigger className="h-7 w-[140px] text-xs px-2 bg-slate-100 border-slate-300">
                        <SelectValue placeholder="Cálculo rápido" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1_mes">1 Mes</SelectItem>
                        <SelectItem value="59_dias">59 Días</SelectItem>
                        <SelectItem value="3_meses">3 Meses</SelectItem>
                        <SelectItem value="6_meses">6 Meses</SelectItem>
                        <SelectItem value="fin_anio">Fin de Año</SelectItem>
                        <SelectItem value="1_anio">1 Año</SelectItem>
                        <SelectItem value="3_anios">3 Años</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <FormField
                control={methods.control}
                name="pat.fecha_vencimiento"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo Zona */}
            <FormField
              control={methods.control}
              name="pat.tipo_zona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ZC">ZC</SelectItem>
                      <SelectItem value="ZR">ZR</SelectItem>
                      <SelectItem value="HN">HN</SelectItem>
                      <SelectItem value="PS">PS</SelectItem>
                      <SelectItem value="OT">OT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Acceso A */}
            <FormField
              control={methods.control}
              name="pat.acceso_pat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acceso a <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Destino / Sector / Oficina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nro Interno */}
            <FormField
              control={methods.control}
              name="pat.nro_interno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nro. Interno <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="1234" 
                        maxLength={5} 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} // Solo números visualmente
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Causa / Motivo */}
            <FormField
              control={methods.control}
              name="pat.causa_motivo_pat"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Motivo / Causa <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Explique el motivo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sección Reutilizable de Solicitante */}
          {/* Funciona automático porque el schema coincide con la estructura esperada */}
          <SolicitanteSection />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Procesando..." : "Confeccionar PAT"}
            </Button>
          </div>

        </form>
      </Form>
    </FormProvider>
  );
}