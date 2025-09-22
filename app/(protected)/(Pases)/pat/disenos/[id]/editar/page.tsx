// app/(protected)/(Pases)/pat/disenos/[id]/editar/page.tsx
import { obtenerDisenoPatPorId } from '@/lib/database/diseno-pat-queries';
import { notFound } from 'next/navigation';
import EditorDisenoPat from '@/components/Pases/diseno/EditorDisenoPat';

type PageProps = {
  params: Promise<{ id: string }>; // evitar warning de Next sobre sync dynamic APIs
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const diseno = await obtenerDisenoPatPorId(id);
  if (!diseno) return notFound();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Editar diseño: {diseno.nombre}</h1>
      <EditorDisenoPat diseno={diseno} />
    </div>
  );
}
