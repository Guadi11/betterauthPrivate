// components/RegistroTotalCard.tsx
import { getTotalRegistros } from "@/lib/database/registros-queries";
import { Users } from "lucide-react";

export default async function RegistroTotalCard() {
  const total = await getTotalRegistros();

  return (
    <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-xs flex items-center space-x-4">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full flex items-center justify-center">
        <Users className="w-8 h-8" />
      </div>
      <div className="flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-gray-700">Total de registros</h2>
      <p className="text-4xl font-bold text-blue-600">{total}</p>
      </div>
    </div>
  );
}
