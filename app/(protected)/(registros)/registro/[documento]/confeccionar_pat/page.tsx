// app/(protected)/(registros)/registro/[documento]/confeccionar_pat/page.tsx
import ConfeccionarPatForm from "@/components/Pases/confeccionar-pat-form";
import { confeccionarPAT } from "@/lib/database/pat-actions";

interface PageProps {
  params: { documento: string };
}

export default async function Page({ params }: PageProps) {
  const documento = decodeURIComponent(params.documento);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Confeccionar Pase de Acceso Transitorio</h1>
        <p className="text-sm text-muted-foreground">
          Registro: <span className="font-medium">{documento}</span>
        </p>
      </header>

      {/* Server Action desacoplada */}
      <ConfeccionarPatForm documento={documento} onSubmit={confeccionarPAT} />
    </div>
  );
}
