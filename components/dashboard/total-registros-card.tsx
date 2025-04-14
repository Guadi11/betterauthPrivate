import { getTotalRegistros } from "@/lib/database/registros-queries";
import {
    Card,
    CardContent
  } from "@/components/ui/card"
import { Users } from "lucide-react";

export default async function TotalRegistrosCard(){
    const total = await getTotalRegistros();

    return (
        <Card className="w-full max-w-sm p-4 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <CardContent className="p-0">
            <p className="text-sm text-gray-500">Total de registros</p>
            <p className="text-3xl font-bold text-blue-600">{total}</p>
          </CardContent>
        </Card>
      );

}