"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// ⚠️ Ajustá la ruta según dónde tengas este archivo:
import SolicitanteSection from "@/components/solicitantes/seleccion-solicitante";

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

interface Props {
  documento: string; // viene del perfil/params
  /**
   * Acción que recibe (documento, values) y debe crear el PAT en la DB.
   * Devolvé { ok: true } o { ok: false, error: "mensaje" }.
   */
  onSubmit: (
    documento: string,
    values: PatFormValues
  ) => Promise<{ ok: boolean; error?: string }>;
}

export default function ConfeccionarPatForm({ documento, onSubmit }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (values: PatFormValues) => {
    setServerError(null);

    // Validación simple: vencimiento >= extensión
    const ext = new Date(values.pat.fecha_extension);
    const ven = new Date(values.pat.fecha_vencimiento);
    if (values.pat.fecha_vencimiento && ven < ext) {
      methods.setError("pat.fecha_vencimiento", {
        type: "manual",
        message: "La fecha de vencimiento no puede ser anterior a la de extensión.",
      });
      return;
    }

    // (Opcional) normalizaciones mínimas
    values.pat.nro_interno = values.pat.nro_interno.trim();
    values.pat.acceso_pat = values.pat.acceso_pat.trim();

    startTransition(async () => {
      const res = await onSubmit(documento, values);
      if (!res.ok) {
        setServerError(res.error || "Ocurrió un error al confeccionar el PAT.");
        return;
      }
      methods.reset({ ...methods.getValues(), pat: { ...methods.getValues().pat, acceso_pat: "", nro_interno: "", causa_motivo_pat: "" } });
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

            <FormField
              control={methods.control}
              name="pat.fecha_vencimiento"
              rules={{ required: "Requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      inputMode="numeric"      // teclado numérico en mobile
                      pattern="\d*"            // hint HTML; no reemplaza la validación
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

          {/* Error general */}
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
