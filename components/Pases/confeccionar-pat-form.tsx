"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SolicitanteSection from "@/components/solicitantes/seleccion-solicitante";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

// --- Tipos y Definiciones ---

type PatTipo = "ZC" | "ZR" | "HN" | "PS" | "OT";

type PatFormValues = {
  pat: {
    fecha_extension: string;      // YYYY-MM-DD
    fecha_vencimiento: string;    // YYYY-MM-DD
    tipo_zona: PatTipo;
    acceso_pat: string;
    nro_interno: string;
    causa_motivo_pat: string;
  };
  solicitante: {
    identificador: string;
    tipo_identificador: "MR" | "DNI";
    nombre: string;
    jerarquia: string;
    destino: string;
    telefono: string;
  };
};

type SubmitResult = { ok: true } | { ok: false; message: string };

interface Props {
  documento: string;
  onSubmit: (documento: string, values: PatFormValues) => Promise<SubmitResult>;
}

// --- Definimos los tipos de duración disponibles ---
type TipoDuracion = 
  | "1_mes" 
  | "59_dias" 
  | "3_meses" 
  | "6_meses" 
  | "fin_anio" 
  | "1_anio" 
  | "3_anios";

// --- Helper para calcular fechas ---
function calcularFechaVencimiento(fechaBase: string, tipo: TipoDuracion): string {
  if (!fechaBase) return "";
  
  // Usamos T00:00:00 para evitar problemas de TimeZone
  const d = new Date(`${fechaBase}T00:00:00`); 
  
  switch (tipo) {
    case "1_mes":
      d.setMonth(d.getMonth() + 1);
      break;
    case "59_dias":
      d.setDate(d.getDate() + 59);
      break;
    case "3_meses":
      d.setMonth(d.getMonth() + 3);
      break;
    case "6_meses":
      d.setMonth(d.getMonth() + 6);
      break;
    case "fin_anio":
      // Mes 11 es Diciembre (0-indexed), Día 31
      // Mantenemos el año de la fecha base (fecha de extensión)
      d.setMonth(11); 
      d.setDate(31);
      break;
    case "1_anio":
      d.setFullYear(d.getFullYear() + 1);
      break;
    case "3_anios":
      d.setFullYear(d.getFullYear() + 3);
      break;
  }

  // Formato YYYY-MM-DD
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// --- Componente Principal ---

export default function ConfeccionarPatForm({ documento, onSubmit }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const today = useMemo(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }, []);

  const methods = useForm<PatFormValues>({
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
    mode: "onSubmit",
  });

  // Observamos la fecha de extensión
  const fechaExtension = useWatch({ control: methods.control, name: "pat.fecha_extension" });

  // Handler para el selector rápido
  const handleDuracionChange = (value: string) => {
    if (!fechaExtension) {
      toast.warning("Seleccione primero una fecha de extensión");
      return;
    }
    
    const nuevaFecha = calcularFechaVencimiento(
      fechaExtension, 
      value as TipoDuracion
    );
    
    methods.setValue("pat.fecha_vencimiento", nuevaFecha, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  const handleSubmit = (values: PatFormValues) => {
    setServerError(null);

    // Validación manual de fechas
    const ext = new Date(`${values.pat.fecha_extension}T00:00:00`);
    const ven = new Date(`${values.pat.fecha_vencimiento}T00:00:00`);
    
    if (values.pat.fecha_vencimiento && ven < ext) {
      methods.setError("pat.fecha_vencimiento", {
        type: "manual",
        message: "La fecha de vencimiento no puede ser anterior a la de extensión.",
      });
      return;
    }

    values.pat.nro_interno = values.pat.nro_interno.trim();
    values.pat.acceso_pat = values.pat.acceso_pat.trim();

    startTransition(async () => {
      const res = await onSubmit(documento, values);
      if (!res.ok) {
        const msg = res.message;
        setServerError(msg);
        toast.error(msg);
        return;
      }
      
      methods.reset({
        ...methods.getValues(),
        pat: {
          ...methods.getValues().pat,
          acceso_pat: "",
          nro_interno: "",
          causa_motivo_pat: "",
        },
      });

      toast.success("PAT confeccionado correctamente.");
      router.push(`/registro/${encodeURIComponent(documento)}`);
    });
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          {/* Encabezado */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Documento del registro:</span> {documento}
            </p>
          </div>

          {/* Campos del PAT */}
          <div className="grid gap-6 md:grid-cols-2">
            
            <FormField
              control={methods.control}
              name="pat.fecha_extension"
              rules={{ required: "Requerido" }}
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

            {/* Selector de Duración Rápida + Input de Vencimiento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className={serverError ? "text-destructive" : ""}>
                    Fecha de vencimiento <span className="text-red-500">*</span>
                </FormLabel>
                
                {/* Selector rápido */}
                <Select onValueChange={handleDuracionChange}>
                    <SelectTrigger className="h-7 w-[150px] text-xs px-2 bg-slate-100 border-slate-300">
                        <SelectValue placeholder="Cálculo rápido" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1_mes">1 Mes</SelectItem>
                        <SelectItem value="59_dias">59 Días</SelectItem>
                        <SelectItem value="3_meses">3 Meses</SelectItem>
                        <SelectItem value="6_meses">6 Meses</SelectItem>
                        <SelectItem value="fin_anio">31 Dic (Año actual)</SelectItem>
                        <SelectItem value="1_anio">1 Año</SelectItem>
                        <SelectItem value="3_anios">3 Años</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <FormField
                control={methods.control}
                name="pat.fecha_vencimiento"
                rules={{ required: "Requerido" }}
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

            <FormField
              control={methods.control}
              name="pat.tipo_zona"
              rules={{ required: "Requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
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

            <FormField
              control={methods.control}
              name="pat.acceso_pat"
              rules={{ required: "Requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acceso a <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Sector / Oficina / Área" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="pat.nro_interno"
              rules={{
                required: "Requerido",
                minLength: { value: 4, message: "Debe tener 4 a 5 dígitos" },
                maxLength: { value: 5, message: "Debe tener 4 a 5 dígitos" },
                pattern:  { value: /^\d{4,5}$/, message: "Solo dígitos (4 a 5)" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nro. Interno <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={5}
                      placeholder="12345"
                      {...field}
                      onChange={(e) => {
                        const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 5);
                        field.onChange(soloDigitos);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="pat.causa_motivo_pat"
              rules={{ required: "Requerido" }}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Motivo / Causa <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Explique el motivo del PAT/PATF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sección Solicitante */}
          <SolicitanteSection />

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Confeccionar PAT"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}