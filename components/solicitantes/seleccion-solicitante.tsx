"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
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

export default function SolicitanteSection() {
  const { control, setValue, clearErrors } = useFormContext()
  const [solicitanteExistente, setSolicitanteExistente] = useState(false);
  
  // 1. Escuchamos solo el campo identificador
  const identificador = useWatch({
    control: control, 
    name: "solicitante.identificador",
  });

  const fueAutocompletadoRef = useRef(false);
  const ultimoIdBuscadoRef = useRef<string>("");

  useEffect(() => {
    const currentId = identificador ?? "";

    // Si es muy corto, reseteamos y no buscamos
    if (currentId.length < 4) {
      setSolicitanteExistente(false);
      ultimoIdBuscadoRef.current = ""; // Reseteamos la referencia
      
      if (fueAutocompletadoRef.current) {
        setValue("solicitante.nombre", "");
        setValue("solicitante.jerarquia", "");
        setValue("solicitante.destino", "");
        setValue("solicitante.telefono", "");
        fueAutocompletadoRef.current = false;
      }
      return;
    }

    // 3. CHECK DE SEGURIDAD: Si el ID es igual al último que buscamos (y ya procesamos), 
    // NO hacemos nada. Esto rompe el bucle infinito.
    if (currentId === ultimoIdBuscadoRef.current) {
        return; 
    }

    const timeoutId = setTimeout(async () => {
      // Doble chequeo dentro del timeout por si el usuario escribió muy rápido
      if (currentId === ultimoIdBuscadoRef.current) return;

      console.log("🔍 Buscando solicitante:", currentId); // Para tu debug
      
      // Marcamos este ID como buscado ANTES de la petición para bloquear reintentos inmediatos
      ultimoIdBuscadoRef.current = currentId;

      try {
        const existente = await verificarSolicitante(currentId);
        
        if (existente) {
          setSolicitanteExistente(true);
          fueAutocompletadoRef.current = true;
          
          // Rellenamos datos (esto causaba el re-render, pero ahora el 'if' de arriba nos protege)
          setValue("solicitante.nombre", existente.nombre);
          setValue("solicitante.jerarquia", existente.jerarquia);
          setValue("solicitante.destino", existente.destino);
          setValue("solicitante.telefono", existente.telefono);
          setValue("solicitante.tipo_identificador", existente.tipo_identificador);
          
          clearErrors("solicitante");
        } else {
          setSolicitanteExistente(false);
          // Si no existe, y antes habíamos autocompletado, limpiamos
          if (fueAutocompletadoRef.current) {
            setValue("solicitante.nombre", "");
            setValue("solicitante.jerarquia", "");
            setValue("solicitante.destino", "");
            setValue("solicitante.telefono", "");
            fueAutocompletadoRef.current = false;
          }
        }
      } catch (error) {
        console.error("Error buscando solicitante", error);
        // Si falló, permitimos buscar de nuevo este ID si el usuario quiere reintentar borrando y escribiendo
        ultimoIdBuscadoRef.current = ""; 
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    
    // 4. IMPORTANTE: Quitamos 'form' de las dependencias. 
    // Solo queremos que esto corra si el string 'identificador' cambia.
  }, [identificador, setValue, clearErrors]); 

  return (
    <div className="pt-4 border-t">
      <h2 className="text-xl font-semibold">Datos del Solicitante</h2>

      {/* Tipo Identificador */}
      <FormField
        control={control}
        name="solicitante.tipo_identificador"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tipo de Identificador <span className="text-red-500">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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

      {/* Identificador */}
      <FormField
        control={control}
        name="solicitante.identificador"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between gap-2">
              <FormLabel>
                Identificador <span className="text-red-500">*</span>
              </FormLabel>

              {solicitanteExistente && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  ✓ Solicitante encontrado
                </span>
              )}
            </div>
            <FormDescription>
              Ingrese Matrícula o DNI. Sin guiones o puntos.
            </FormDescription>
            <FormControl>
              <Input 
                inputMode="numeric" 
                placeholder="4984245" 
                maxLength={8} 
                {...field} 
                value={field.value || ""} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Nombre */}
      <FormField
        control={control}
        name="solicitante.nombre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nombre Completo <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input disabled={solicitanteExistente} {...field} value={field.value || ""} maxLength={100} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Jerarquía */}
      <FormField
        control={control}
        name="solicitante.jerarquia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Jerarquía <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="CPMU"
                maxLength={6}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Destino */}
      <FormField
        control={control}
        name="solicitante.destino"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Destino <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="SIAG"
                maxLength={8}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Teléfono */}
      <FormField
        control={control}
        name="solicitante.telefono"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={solicitanteExistente}
                placeholder="+54 2932 ..."
                maxLength={20}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}