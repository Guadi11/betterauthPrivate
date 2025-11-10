"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crearRegistro } from "@/lib/database/registro-actions";
import { UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { RegistroSchema, RegistroFormData } from "@/lib/zod/registro-schemas"; // <- nuevo import

export default function RegistroForm() {
  const router = useRouter();

  const form = useForm<RegistroFormData>({
    resolver: zodResolver(RegistroSchema),
    defaultValues: {
      documento: "",
      tipo_documento: "DNI",
      nombre: "",
      apellido: "",
      fecha_nacimiento: undefined,
      nacionalidad: "",
      domicilio_real: "",
      domicilio_eventual: "",
      observacion_cc: false,
    },
  });

  const tipoDoc = form.watch("tipo_documento");

  async function onSubmit(values: RegistroFormData) {
    const result = await crearRegistro(values);

    if (result.success) {
      toast.success("Registro creado correctamente");
      router.push(`/registro/${values.documento}`);
      return;
    }

    // Setear errores de campo si existen
    if (result.fieldErrors) {
      (Object.entries(result.fieldErrors) as Array<[keyof RegistroFormData, string | undefined]>)
        .forEach(([field, message]) => {
          if (message) form.setError(field, { message });
        });
    }

    // Mostrar toast para errores generales
    if (result.message) {
      toast.error("No se pudo crear el registro", { description: result.message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Documento <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={tipoDoc === "DNI" ? "81544970" : "AA123456"}
                  inputMode={tipoDoc === "DNI" ? "numeric" : "text"}
                  maxLength={tipoDoc === "DNI" ? 8 : 20}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    let v = e.target.value;
                    v = tipoDoc === "DNI"
                      ? v.replace(/\D/g, "") // solo dígitos
                      : v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); // alfanum y mayúsculas
                    field.onChange(v);
                  }}
                />
              </FormControl>
              <FormDescription>Ingrese el {tipoDoc === "DNI" ? "DNI (7–8 dígitos)" : "Pasaporte (6–20 alfanumérico)"}</FormDescription>
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
                Tipo de Documento <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Seleccione el tipo de documento</FormDescription>
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
                  <Input placeholder="Ingrese su nombre" maxLength={100} {...field} />
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
                    <Input placeholder="Ingrese su apellido" maxLength={100} {...field} />
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
                    value={field.value instanceof Date && !isNaN(field.value.getTime()) 
                      ? field.value.toISOString().split('T')[0] 
                      : ''}
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
                    <Input placeholder="Argentina" maxLength={100} {...field} />
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
                    <Input placeholder="Calle 123, Ciudad" maxLength={255} {...field} />
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
                    <Input placeholder="Calle 456, Ciudad" maxLength={100} {...field} />
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