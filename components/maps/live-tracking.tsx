"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bus, MapPin, Clock, Users, Zap } from "lucide-react"

interface LiveTrackingProps {
  vehicleId?: string
  routeId?: string
}

interface VehicleData {
  id: string
  routeName: string
  currentLocation: string
  nextStop: string
  estimatedArrival: string
  speed: number
  occupancy: number
  maxCapacity: number
  status: "on-time" | "delayed" | "early"
  lastUpdate: Date
}

export function LiveTracking({ vehicleId, routeId }: LiveTrackingProps) {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    const fetchVehicleData = () => {
      // Simulate API call
      setTimeout(() => {
        const mockData: VehicleData = {
          id: vehicleId || "BUS001",
          routeName: "Ruta 15 - Centro",
          currentLocation: "Universidad Cooperativa",
          nextStop: "Centro Comercial Unicentro",
          estimatedArrival: "3 min",
          speed: 25,
          occupancy: 28,
          maxCapacity: 40,
          status: "on-time",
          lastUpdate: new Date(),
        }
        setVehicleData(mockData)
        setIsLoading(false)
      }, 1000)
    }

    fetchVehicleData()

    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(fetchVehicleData, 30000) // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [vehicleId, autoRefresh])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!vehicleData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontró información del vehículo</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time":
        return "default"
      case "delayed":
        return "destructive"
      case "early":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on-time":
        return "A tiempo"
      case "delayed":
        return "Retrasado"
      case "early":
        return "Adelantado"
      default:
        return "Desconocido"
    }
  }

  const occupancyPercentage = (vehicleData.occupancy / vehicleData.maxCapacity) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Seguimiento en Vivo
            </CardTitle>
            <CardDescription>Información en tiempo real del vehículo</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : "bg-transparent"}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></div>
            {autoRefresh ? "Activo" : "Pausado"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Bus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{vehicleData.routeName}</h3>
              <p className="text-sm text-muted-foreground">Vehículo: {vehicleData.id}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(vehicleData.status)}>{getStatusLabel(vehicleData.status)}</Badge>
        </div>

        {/* Current Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium mb-1">Ubicación actual:</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {vehicleData.currentLocation}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Próxima parada:</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {vehicleData.nextStop} - {vehicleData.estimatedArrival}
            </p>
          </div>
        </div>

        {/* Speed and Occupancy */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium mb-1">Velocidad:</p>
            <p className="text-lg font-bold text-primary">{vehicleData.speed} km/h</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Ocupación:</p>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {vehicleData.occupancy}/{vehicleData.maxCapacity}
              </span>
            </div>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nivel de ocupación</span>
            <span className="text-sm text-muted-foreground">{occupancyPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyPercentage < 50 ? "bg-green-500" : occupancyPercentage < 80 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {occupancyPercentage < 50 ? "Disponible" : occupancyPercentage < 80 ? "Moderadamente lleno" : "Muy lleno"}
          </p>
        </div>

        {/* Last Update */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Última actualización: {vehicleData.lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
