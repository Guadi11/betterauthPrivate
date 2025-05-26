"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { crearRegistro } from "@/lib/database/registro-actions"
import { UserRoundCheck } from "lucide-react"


export const RegistroSchema = z.object({
    documento: z.string()
      .min(6, "El documento debe tener al menos 6 caracteres")
      .max(20, "El documento no puede superar 20 caracteres")
      .refine((value) => {
        const isValidDNI = value.length >= 7 && value.length <= 8 && /^\d+$/.test(value);
        const isValidPassport = value.length >= 6 && value.length <= 20 && /^[A-Z0-9]+$/.test(value);
        return isValidDNI || isValidPassport;
      }, { 
        message: "El documento debe ser numérico para DNI (7-8 dígitos) o alfanumérico para Pasaporte" 
      }),
    
    tipo_documento: z.enum(['DNI', 'Pasaporte'], {
      errorMap: () => ({ message: "Tipo de documento debe ser DNI o Pasaporte" })
    }),
    
    nombre: z.string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede superar 100 caracteres")
      .trim(),
    
    apellido: z.string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(100, "El apellido no puede superar 100 caracteres")
      .trim(),
    
    fecha_nacimiento: z.date().optional(),
    
    nacionalidad: z.string()
      .max(100, "La nacionalidad no puede superar 100 caracteres")
      .optional(),
    
    domicilio_real: z.string()
      .max(255, "El domicilio real no puede superar 255 caracteres")
      .optional(),
    
    domicilio_eventual: z.string()
      .max(255, "El domicilio eventual no puede superar 255 caracteres")
      .optional(),
    
    referido_cc: z.boolean().default(false)
  }).strict();

export default function RegistroForm(){
    const router = useRouter();
    //1. Definir el formulario
    const form = useForm<z.infer<typeof RegistroSchema>>({
        resolver: zodResolver(RegistroSchema),
        defaultValues:{
            documento: "",
            tipo_documento: "DNI",
            nombre: "",
            apellido: "",
            fecha_nacimiento: undefined,
            nacionalidad: "",
            domicilio_real: "",
            domicilio_eventual: "",
            referido_cc: false
        }
    })

    //Observa el formulario e imprime los valores a medida que cambian
    //console.log("Form values:", form.watch());

    //2. Definir el handler 
    async function onSubmit(values: z.infer<typeof RegistroSchema>) {
      try {
        console.log("Enviando datos...", values);
        
        // Llamar a la server action
        const result = await crearRegistro(values);
        
        if (result.success) {
          router.push(`/registro/${values.documento}`);
        } else {
          if (result.error?.includes("documento")) {
            form.setError("documento", { message: result.error });
          } else {
            // Podés agregar manejo para otros campos o errores generales
            console.error("Otro error:", result.error);
          }
        }
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
      }
    }
    
    return(
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="documento"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                  Documento
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                    <Input placeholder="81544970" {...field} />
                </FormControl>
                <FormDescription>
                    Ingrese el DNI o Pasaporte
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="tipo_documento"
            render={({ field }) => (
                <FormItem>
                <FormLabel>
                  Tipo de Documento
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                </Select>
                <FormDescription>
                    Seleccione el tipo de documento
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese su nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            />

            <FormField
              control={form.control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apellido
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese su apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de nacimiento (campo opcional) */}
            <FormField
              control={form.control}
              name="fecha_nacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value ? field.value.toISOString().split('T')[0] : ''} 
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T12:00:00') : undefined;
                      field.onChange(date);
                    }}
                  />
                  </FormControl>
                  <FormDescription>
                    Ingrese su fecha de nacimiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nacionalidad (campo opcional) */}
            <FormField
              control={form.control}
              name="nacionalidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nacionalidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Argentina" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ingrese su nacionalidad
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Domicilio real (campo opcional) */}
            <FormField
              control={form.control}
              name="domicilio_real"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio Real</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 123, Ciudad" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ingrese su domicilio real
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Domicilio eventual (campo opcional) */}
            <FormField
              control={form.control}
              name="domicilio_eventual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio Eventual</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle 456, Ciudad" {...field} />
                  </FormControl>
                  <FormDescription>
                    Ingrese su domicilio eventual si corresponde
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex justify-center mt-4">
              <Button type="submit">
                <UserRoundCheck/>
                Guardar Registro
              </Button>
            </div>
        </form>
        </Form>
    )
}