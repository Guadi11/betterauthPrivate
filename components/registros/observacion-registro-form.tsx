"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

// A definir en registro-actions.ts más adelante
import { actualizarObservacionRegistro } from "@/lib/database/registro-actions"

const schema = z.object({
  documento: z.string(),
  observacion: z.string().max(500, "Máximo 500 caracteres"),
})

type FormValues = z.infer<typeof schema>

export default function FormularioObservacion({ documento, valorInicial }: { documento: string, valorInicial: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      documento,
      observacion: valorInicial ?? "",
    },
  })

  const [isPending, startTransition] = useTransition()

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const res = await actualizarObservacionRegistro(data.documento, data.observacion)
      if (res.success) {
        toast.success("Observación guardada correctamente")
      } else {
        toast.error("Error al guardar: " + (res.error ?? "Error inesperado"))
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea placeholder="Observación" {...field} disabled={isPending} className="bg-yellow-50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          Guardar observación
        </Button>
      </form>
    </Form>
  )
}
