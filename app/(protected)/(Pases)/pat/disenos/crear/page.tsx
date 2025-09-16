// app/(protected)/(pases)/pat/diseno/crear/page.tsx
import { assertRolPersonalPases } from "@/lib/server-action-helpers";
import { CrearDisenoPatForm } from "@/components/Pases/diseno/crear-diseno-form";

export default async function Page() {
  await assertRolPersonalPases();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Crear diseño de PAT</h1>
        <p className="text-sm text-muted-foreground">
          Definí los datos iniciales del diseño. Más adelante podrás editarlo visualmente en el editor.
        </p>
      </div>
      <CrearDisenoPatForm />
    </div>
  );
}
