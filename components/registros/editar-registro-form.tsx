'use client'

import { useState } from "react"
import { z } from "zod"
import { Registro } from "@/lib/database/registros-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

const registroSchema = z.object({
  documento: z.string().min(6),
  tipo_documento: z.enum(["DNI", "Pasaporte"]),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().optional(),
  domicilio_real: z.string().optional(),
  domicilio_eventual: z.string().optional(),
  observacion_cc: z.boolean().optional()
})

type FormData = z.infer<typeof registroSchema>

export function EditRegistroForm({ registro }: { registro: Registro }) {
  const [form, setForm] = useState<FormData>({
    ...registro,
    fecha_nacimiento: registro.fecha_nacimiento
      ? format(new Date(registro.fecha_nacimiento), "yyyy-MM-dd")
      : undefined,
      nacionalidad: registro.nacionalidad ?? undefined,
      domicilio_real: registro.domicilio_real ?? undefined,
      domicilio_eventual: registro.domicilio_eventual ?? undefined,
      observacion_cc: registro.observacion_cc ?? false,
  })
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleChange = (key: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    const parse = registroSchema.safeParse(form)
    if (!parse.success) {
      alert("Hay errores en el formulario."+parse.error)
      return
    }
    // Lógica de update pendiente (siguiente paso)
    console.log("Enviar a backend:", form)
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div>
        <label>Tipo de Documento</label>
        <Select
          value={form.tipo_documento}
          onValueChange={(value) => handleChange("tipo_documento", value as "DNI" | "Pasaporte")}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DNI">DNI</SelectItem>
            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label>Documento</label>
        <Input value={form.documento} onChange={e => handleChange("documento", e.target.value)} />
      </div>

      <div>
        <label>Nombre</label>
        <Input value={form.nombre} onChange={e => handleChange("nombre", e.target.value)} />
      </div>

      <div>
        <label>Apellido</label>
        <Input value={form.apellido} onChange={e => handleChange("apellido", e.target.value)} />
      </div>

      <div>
        <label>Fecha de nacimiento</label>
        <Input type="date" value={form.fecha_nacimiento} onChange={e => handleChange("fecha_nacimiento", e.target.value)} />
      </div>

      <div>
        <label>Nacionalidad</label>
        <Input value={form.nacionalidad || ""} onChange={e => handleChange("nacionalidad", e.target.value)} />
      </div>

      <div>
        <label>Domicilio Real</label>
        <Textarea value={form.domicilio_real || ""} onChange={e => handleChange("domicilio_real", e.target.value)} />
      </div>

      <div>
        <label>Domicilio Eventual</label>
        <Textarea value={form.domicilio_eventual || ""} onChange={e => handleChange("domicilio_eventual", e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={form.observacion_cc || false}
          onCheckedChange={(checked) => handleChange("observacion_cc", Boolean(checked))}
        />
        <label>Observacion a CC</label>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">Guardar cambios</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>¿Confirmás que querés guardar los cambios?</DialogTitle>
          <DialogDescription>
            Revise los datos.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
