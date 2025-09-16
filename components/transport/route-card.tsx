import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, Clock, MapPin } from "lucide-react"

interface RouteCardProps {
  routeName: string
  origin: string
  destination: string
  estimatedTime: string
  price: string
  status: "active" | "delayed" | "inactive"
  nextArrival?: string
}

export function RouteCard({
  routeName,
  origin,
  destination,
  estimatedTime,
  price,
  status,
  nextArrival,
}: RouteCardProps) {
  const statusColors = {
    active: "default",
    delayed: "secondary",
    inactive: "destructive",
  } as const

  const statusLabels = {
    active: "Activo",
    delayed: "Retrasado",
    inactive: "Inactivo",
  } as const

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{routeName}</h3>
          </div>
          <Badge variant={statusColors[status]}>{statusLabels[status]}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {origin} → {destination}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{estimatedTime}</span>
            </div>
            <span className="font-medium text-primary">{price}</span>
          </div>

          {nextArrival && <div className="text-sm text-muted-foreground">Próximo bus: {nextArrival}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
