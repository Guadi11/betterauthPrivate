import { EditRegistroForm } from "@/components/registros/editar-registro-form"
import { obtenerRegistroPorDocumento, Registro } from "@/lib/database/registros-queries"

export default async function EditarRegistroPage({ params }: { params: Promise<{ documento: string }> }) {
  const { documento } = await params;
  const doc = decodeURIComponent(documento);

  const registro: Registro | null = await obtenerRegistroPorDocumento(doc)

  if (!registro) {
    return <div className="p-4 text-red-600">No se encontró el registro con el documento {doc}</div>
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Registro</h1>
      <EditRegistroForm registro={registro} />
    </main>
  )
}
