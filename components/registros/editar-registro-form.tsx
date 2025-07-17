'use client'

import { useState } from "react"
import { z } from "zod"
import { Registro } from "@/lib/database/registros-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RegistroSchema } from "./crear-registro-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { actualizarRegistro } from "@/lib/database/registro-actions"
import {useRouter} from "next/navigation"

export function EditRegistroForm({ registro }: { registro: Registro }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof RegistroSchema>>({
          resolver: zodResolver(RegistroSchema),
          defaultValues:{
            documento: registro.documento,
            tipo_documento: registro.tipo_documento,
            nombre: registro.nombre,
            apellido: registro.apellido,
            fecha_nacimiento: registro.fecha_nacimiento ?? undefined,
            nacionalidad: registro.nacionalidad ?? "",
            domicilio_real: registro.domicilio_real ?? "",
            domicilio_eventual: registro.domicilio_eventual ?? "",
            observacion_cc: registro.observacion_cc ?? false,
          }
      })

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onSubmit = async (values: z.infer<typeof RegistroSchema>) => {
    console.log("Enviar a backend:", values);
    // Acá iría la llamada al backend
    const res = await actualizarRegistro(values);

    if (res.success) {
      alert("Registro actualizado exitosamente!");
      router.push(`/registro/${values.documento}`);
    } else {
      alert("Hubo un error al actualizar el registro.");
    }
  };

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <FormField
          control={form.control}
          name="tipo_documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Documento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
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
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documento</FormLabel>
              <FormControl>
                <Input {...field} maxLength={20} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} maxLength={100} />
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
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

            <FormField
              control={form.control}
              name="observacion_cc"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Observación a CC</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="button" className="mt-4">Guardar cambios</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogTitle>¿Confirmás que querés guardar los cambios?</DialogTitle>
                <DialogDescription>
                  Revise los datos antes de confirmar.
                </DialogDescription>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                  <Button
                    onClick={() => {
                      form.handleSubmit(onSubmit)(); // ejecuta submit si es válido
                      setConfirmOpen(false);         // cierra modal
                    }}
                  >
                    Confirmar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </form>
      </Form>
  )
}
