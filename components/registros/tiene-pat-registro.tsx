import { Card, CardContent } from "@/components/ui/card"

export default async function PatVencimiento() {
  // Por ahora no hay fetch, esto es mock
  const fechaVencimiento = "27/03/2026"

  return (
    <Card className="bg-gray-50 p-3 border border-gray-200 shadow-sm w-fit">
      <CardContent className="p-2">
        <div className="text-sm font-semibold text-blue-800">TIENE PAT Y VENCE:</div>
        <div className="text-lg font-bold text-orange-600">{fechaVencimiento}</div>
      </CardContent>
    </Card>
  )
}
