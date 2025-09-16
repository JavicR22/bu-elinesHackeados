"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"

interface Stop {
  lat: number
  lng: number
  name: string
  routes: string[]
  estimatedTime?: number
}

interface LocationTrackerProps {
  stops: Stop[]
  onNearestStopChange?: (stop: Stop | null) => void
}

export default function LocationTracker({ stops, onNearestStopChange }: LocationTrackerProps) {
  const { location, error, loading, permission, requestPermission } = useGeolocation({
    enableHighAccuracy: true,
    watch: true,
    timeout: 15000,
    maximumAge: 30000,
  })

  const [nearestStop, setNearestStop] = useState<Stop | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (location && stops.length > 0) {
      const nearest = findNearestStop(location, stops)

      setNearestStop((prev) =>
        prev?.name !== nearest.stop.name ? nearest.stop : prev
      )

      setDistance((prev) =>
        prev !== nearest.distance ? nearest.distance : prev
      )

      onNearestStopChange?.(nearest.stop)
    }
  }, [location, stops]) // 👈 limpio de dependencias problemáticas

  const findNearestStop = (userLocation: { lat: number; lng: number }, stopsArray: Stop[]) => {
    let nearestStop = stopsArray[0]
    let minDistance = calculateDistance(userLocation, stopsArray[0])

    stopsArray.forEach((stop) => {
      const dist = calculateDistance(userLocation, stop)
      if (dist < minDistance) {
        minDistance = dist
        nearestStop = stop
      }
    })

    return { stop: nearestStop, distance: minDistance }
  }

  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
    const dLon = ((pos2.lng - pos1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1.lat * Math.PI) / 180) *
        Math.cos((pos2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`
    }
    return `${dist.toFixed(1)}km`
  }

  const getWalkingTime = (dist: number) => {
    // Velocidad promedio de caminata: 5 km/h
    const walkingSpeedKmh = 5
    const timeHours = dist / walkingSpeedKmh
    const timeMinutes = Math.round(timeHours * 60)
    return Math.max(1, timeMinutes)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Obteniendo ubicación...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detectando tu posición actual</p>
        </CardContent>
      </Card>
    )
  }

  if (error || permission === "denied") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Error de ubicación</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={requestPermission} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Intentar nuevamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Ubicación no disponible</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={requestPermission} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            Activar ubicación
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estado de ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-green-600" />
            <span>Ubicación activa</span>
          </CardTitle>
          <CardDescription>
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <MapPin className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
            <Badge variant="outline">Precisión alta</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Parada más cercana */}
      {nearestStop && distance !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Parada más cercana</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{nearestStop.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formatDistance(distance)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{getWalkingTime(distance)} min caminando</span>
                </div>
              </div>
            </div>

            {/* Rutas disponibles */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Rutas disponibles:</h4>
              <div className="flex flex-wrap gap-2">
                {nearestStop.routes.map((route, index) => (
                  <Badge key={index} variant="outline">
                    {route}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tiempo estimado de llegada */}
            {nearestStop.estimatedTime && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Próximo bus en {nearestStop.estimatedTime} minutos</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actualización automática */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Actualizando en tiempo real</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Activo
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
