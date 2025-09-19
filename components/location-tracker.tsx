"use client"

import { useEffect, useState, useCallback } from "react"
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

declare global {
    interface Window {
        google: any
    }
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
    const [distance, setDistance] = useState<number | null>(null) // km
    const [walkingTime, setWalkingTime] = useState<number | null>(null) // min

    // Usa Google Maps Distance Matrix
    const calculateWalkingDistance = (
        origin: google.maps.LatLngLiteral,
        destination: google.maps.LatLngLiteral
    ): Promise<{ distanceKm: number; durationMin: number }> => {
        return new Promise((resolve, reject) => {
            const service = new window.google.maps.DistanceMatrixService()

            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: window.google.maps.TravelMode.WALKING,
                    unitSystem: window.google.maps.UnitSystem.METRIC,
                },
                (response, status) => {
                    if (status === "OK" && response.rows[0].elements[0].status === "OK") {
                        const element = response.rows[0].elements[0]
                        const distanceKm = element.distance.value / 1000 // en km
                        const durationMin = Math.round(element.duration.value / 60) // en minutos
                        resolve({ distanceKm, durationMin })
                    } else {
                        reject(status)
                    }
                }
            )
        })
    }

    // Encuentra la parada más cercana usando Google Maps
    const findNearestStop = useCallback(
        async (userLocation: { lat: number; lng: number }, stopsArray: Stop[]) => {
            if (!stopsArray.length) return null

            let nearest = stopsArray[0]
            let minDistance = Infinity
            let bestTime = Infinity

            for (const stop of stopsArray) {
                try {
                    const { distanceKm, durationMin } = await calculateWalkingDistance(userLocation, stop)
                    if (distanceKm < minDistance) {
                        minDistance = distanceKm
                        bestTime = durationMin
                        nearest = stop
                    }
                } catch (err) {
                    console.error("Error calculando distancia:", err)
                }
            }

            return { stop: nearest, distanceKm: minDistance, durationMin: bestTime }
        },
        []
    )

    // Efecto principal
    useEffect(() => {
        if (!location || !stops.length) {
            setNearestStop(null)
            setDistance(null)
            setWalkingTime(null)
            return
        }

        const updateNearest = async () => {
            const result = await findNearestStop(location, stops)
            if (!result) return

            setNearestStop(prev => {
                if (!prev || prev.name !== result.stop.name) {
                    return result.stop
                }
                return prev
            })

            setDistance(result.distanceKm)
            setWalkingTime(result.durationMin)
        }

        updateNearest()
    }, [location, stops, findNearestStop])

    // Notificar a componente padre
    useEffect(() => {
        if (!nearestStop) {
            onNearestStopChange?.(null)
            return
        }
        const timeoutId = setTimeout(() => {
            onNearestStopChange?.(nearestStop)
        }, 0)
        return () => clearTimeout(timeoutId)
    }, [nearestStop, onNearestStopChange])

    const formatDistance = useCallback((dist: number) => {
        if (dist < 1) {
            return `${Math.round(dist * 1000)}m`
        }
        return `${dist.toFixed(1)}km`
    }, [])

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
                                {walkingTime !== null && (
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{walkingTime} min caminando</span>
                                    </div>
                                )}
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
                                    <span className="font-medium">
                    Próximo bus en {nearestStop.estimatedTime} minutos
                  </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
