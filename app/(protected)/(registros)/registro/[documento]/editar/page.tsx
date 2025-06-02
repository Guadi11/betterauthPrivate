import { EditRegistroForm } from "@/components/registros/editar-registro-form"
import { obtenerRegistroPorDocumento, Registro } from "@/lib/database/registros-queries"

export default async function EditarRegistroPage({ params }: { params: { documento: string } }) {
  const documento = params.documento;

  const registro: Registro | null = await obtenerRegistroPorDocumento(documento)

  if (!registro) {
    return <div className="p-4 text-red-600">No se encontró el registro con el documento {documento}</div>
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Registro</h1>
      <EditRegistroForm registro={registro} />
    </main>
  )
}
