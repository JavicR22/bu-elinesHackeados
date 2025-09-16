"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock } from "lucide-react"

interface RoutePlannerProps {
    onRouteCalculated?: (route: any) => void
}

interface RouteResult {
    id: string
    routeName: string
    duration: string
    distance: string
    price: number
    steps: RouteStep[]
}

interface RouteStep {
    instruction: string
    duration: string
    mode: "walking" | "transit"
    transitDetails?: {
        line: string
        stops: number
    }
}

export function RoutePlanner({ onRouteCalculated }: RoutePlannerProps) {
    const [origin, setOrigin] = useState("")
    const [destination, setDestination] = useState("")
    const [isCalculating, setIsCalculating] = useState(false)
    const [routes, setRoutes] = useState<RouteResult[]>([])
    const [map, setMap] = useState<any>(null)
    const [directionsService, setDirectionsService] = useState<any>(null)
    const [directionsRenderer, setDirectionsRenderer] = useState<any>(null)

    const mapRef = useRef<HTMLDivElement>(null)

    // Inicializar Google Maps y servicios
    useEffect(() => {
        if (window.google && mapRef.current && !map) {
            const gmap = new window.google.maps.Map(mapRef.current, {
                center: { lat: 4.15, lng: -73.63 }, // Villavicencio
                zoom: 13,
            })
            setMap(gmap)

            const ds = new window.google.maps.DirectionsService()
            const dr = new window.google.maps.DirectionsRenderer({ map: gmap })

            setDirectionsService(ds)
            setDirectionsRenderer(dr)
        }
    }, [map])

    // Limpieza al desmontar
    useEffect(() => {
        return () => {
            if (directionsRenderer) {
                directionsRenderer.setMap(null)
            }
        }
    }, [directionsRenderer])

    const calculateRoute = useCallback(async () => {
        if (!origin || !destination || !directionsService || !directionsRenderer) return

        setIsCalculating(true)

        try {
            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: window.google.maps.TravelMode.TRANSIT,
                },
                (result: any, status: any) => {
                    if (status === "OK" && result) {
                        directionsRenderer.setDirections(result)

                        // Extraer datos simples (ejemplo)
                        const leg = result.routes[0].legs[0]
                        const route: RouteResult = {
                            id: "realRoute",
                            routeName: "Ruta recomendada",
                            duration: leg.duration.text,
                            distance: leg.distance.text,
                            price: 3000, // ⚠️ Aquí podrías calcular tarifas reales si quieres
                            steps: leg.steps.map((step: any) => ({
                                instruction: step.instructions,
                                duration: step.duration.text,
                                mode: step.travel_mode.toLowerCase(),
                                transitDetails: step.transit ? {
                                    line: step.transit.line.short_name,
                                    stops: step.transit.num_stops,
                                } : undefined,
                            })),
                        }

                        setRoutes([route])
                        if (onRouteCalculated) {
                            onRouteCalculated(route)
                        }
                    } else {
                        console.error("Error calculating route:", status)
                    }
                    setIsCalculating(false)
                }
            )
        } catch (error) {
            console.error("Error calculating route:", error)
            setIsCalculating(false)
        }
    }, [origin, destination, directionsService, directionsRenderer, onRouteCalculated])

    const selectRoute = (route: RouteResult) => {
        if (onRouteCalculated) {
            onRouteCalculated(route)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Planificador de Rutas
                </CardTitle>
                <CardDescription>Encuentra la mejor ruta para tu destino</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin">Origen</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="origin"
                                placeholder="Desde dónde sales..."
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="destination">Destino</Label>
                        <div className="relative">
                            <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="destination"
                                placeholder="A dónde quieres ir..."
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Button onClick={calculateRoute} disabled={!origin || !destination || isCalculating} className="w-full">
                        {isCalculating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Calculando...
                            </>
                        ) : (
                            <>
                                <Navigation className="h-4 w-4 mr-2" />
                                Calcular Ruta
                            </>
                        )}
                    </Button>
                </div>

                {/* Contenedor del mapa */}
                <div ref={mapRef} style={{ width: "100%", height: "400px" }} />

                {routes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Rutas Disponibles</h3>
                        {routes.map((route) => (
                            <Card key={route.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="p-4" onClick={() => selectRoute(route)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">{route.routeName}</h4>
                                        <Badge variant="secondary">${route.price.toLocaleString()}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{route.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{route.distance}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {route.steps.map((step, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${step.mode === "walking" ? "bg-blue-500" : "bg-green-500"}`}
                                                ></div>
                                                <span className="flex-1" dangerouslySetInnerHTML={{ __html: step.instruction }} />
                                                <span className="text-muted-foreground">{step.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
