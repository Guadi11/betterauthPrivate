"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { verificarSolicitante } from "@/lib/database/solicitante-actions";

// Tipo mínimo local para el formulario (solo los campos que tocamos aquí)
type FormData = {
  solicitante: {
    identificador: string;
    tipo_identificador: "MR" | "DNI";
    nombre: string;
    jerarquia: string;
    destino: string;
    telefono: string;
  };
};

export default function SolicitanteSection() {
  const form = useFormContext<FormData>();
  const [solicitanteExistente, setSolicitanteExistente] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fueAutocompletadoRef = useRef(false);

  useEffect(() => {
    const chequear = async () => {
      const id = form.getValues("solicitante.identificador");
      if ((id ?? "").length >= 4) {
        const existente = await verificarSolicitante(id);
        setSolicitanteExistente(!!existente);
        if (existente) {
          fueAutocompletadoRef.current = true;
          form.setValue("solicitante.nombre", existente.nombre);
          form.setValue("solicitante.jerarquia", existente.jerarquia);
          form.setValue("solicitante.destino", existente.destino);
          form.setValue("solicitante.telefono", existente.telefono);
          form.setValue(
            "solicitante.tipo_identificador",
            existente.tipo_identificador
          );
        } else{
            if (fueAutocompletadoRef.current) {
                form.setValue("solicitante.nombre", "");
                form.setValue("solicitante.jerarquia", "");
                form.setValue("solicitante.destino", "");
                form.setValue("solicitante.telefono", "");
                fueAutocompletadoRef.current = false;
            }
        }
      }else{
        // Si el ID es menor a 4, liberamos campos y dejamos que el usuario escriba
        setSolicitanteExistente(false);
        // Limpiamos solo si había sido autocompletado
        if (fueAutocompletadoRef.current) {
        form.setValue("solicitante.nombre", "");
        form.setValue("solicitante.jerarquia", "");
        form.setValue("solicitante.destino", "");
        form.setValue("solicitante.telefono", "");
        }
        fueAutocompletadoRef.current = false;
      }
    };

    const subscription = form.watch((_, { name }) => {
      if (name === "solicitante.identificador") {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(chequear, 300);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form]);

  return (
    <div className="pt-4 border-t">
      <h2 className="text-xl font-semibold">Datos del Solicitante</h2>

      <FormField
        control={form.control}
        name={"solicitante.tipo_identificador" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tipo de Identificador
              <span className="text-red-500">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
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

      <FormField
        control={form.control}
        name={"solicitante.identificador" as const}
        render={({ field }) => (
          <FormItem>
                <div className="flex items-center justify-between gap-2">
                    <FormLabel>
                    Identificador <span className="text-red-500">*</span>
                    </FormLabel>

                    {solicitanteExistente && (
                    <span
                        className="inline-flex items-center rounded-full
                                bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700
                                ring-1 ring-inset ring-emerald-200
                                dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800"
                    >
                        ✓ Solicitan­te encontrado
                    </span>
                    )}
                </div>
            <FormDescription>
              Ingrese Matrícula o DNI del solicitante. Sin guiones o puntos.
            </FormDescription>
            <FormControl>
              <Input inputMode="numeric" placeholder="4984245" maxLength={8} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"solicitante.nombre" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nombre Completo
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input disabled={solicitanteExistente} {...field} maxLength={100} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"solicitante.jerarquia" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Jerarquía
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="CPMU"
                maxLength={6}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"solicitante.destino" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Destino
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="SIAG"
                maxLength={8}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"solicitante.telefono" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="+54 2932 458791"
                maxLength={20}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}