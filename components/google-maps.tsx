"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

declare global {
    interface Window {
        google: any
    }
}

interface LatLng {
    lat: number
    lng: number
    name?: string
}

interface RouteObj {
    path?: google.maps.LatLngLiteral[]
    busMarkers?: google.maps.Marker[]
    busSteps?: number[]
    directionsRenderer?: google.maps.DirectionsRenderer
    stopSteps?: number[] // Índices de los pasos donde están las paradas
}

// === Función para calcular ETA desde la posición del bus hasta la parada ===
function computeETAToStop(path: google.maps.LatLngLiteral[], busIndex: number, stopIndex: number) {
    if (busIndex >= stopIndex) return -1 // Bus ya pasó la parada

    const baseSpeed = 5.55 // 20 km/h en m/s
    let distance = 0

    for (let i = busIndex; i < stopIndex; i++) {
        distance += window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(path[i]),
            new window.google.maps.LatLng(path[i + 1])
        )
    }

    return distance / baseSpeed / 60 // minutos
}

export default function MapaRutas() {
    const mapRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const scriptLoadedRef = useRef(false)

    const route1 = useRef<RouteObj>({})
    const route2 = useRef<RouteObj>({})

    const stops1: LatLng[] = [
        { lat:4.119962, lng:-73.565602, name:'San Antonio'},
        { lat:4.128293, lng:-73.568883, name:'Camino Ganadero'},
        { lat:4.132105, lng:-73.565558, name:'Hotel Campanario'},
        { lat:4.138859, lng:-73.594127, name:'Avenida Catama'},
        { lat:4.149229, lng:-73.628838, name:'Hotel Rosada'}
    ]

    const stops2: LatLng[] = [
        { lat:4.142572, lng:-73.629326, name:'Plaza Los Libertadores'},
        { lat:4.144660, lng:-73.628400, name:'Catedral'},
        { lat:4.146520, lng:-73.627050, name:'Parque Infantil'},
        { lat:4.149890, lng:-73.626250, name:'Siete de Agosto'},
        { lat:4.152100, lng:-73.624800, name:'Terminalito'}
    ]

    // Función para encontrar el paso más cercano a una parada
    const findClosestStepToStop = (path: google.maps.LatLngLiteral[], stop: LatLng): number => {
        let minDistance = Infinity
        let closestStep = 0

        path.forEach((point, index) => {
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(point),
                new window.google.maps.LatLng(stop)
            )
            if (distance < minDistance) {
                minDistance = distance
                closestStep = index
            }
        })

        return closestStep
    }

    // Función para obtener ETAs actualizadas para una parada
    const getETAsForStop = (routeObj: RouteObj, stopIndex: number, routeStops: LatLng[]) => {
        if (!routeObj.path || !routeObj.busSteps || !routeObj.stopSteps) return []

        const stopStep = routeObj.stopSteps[stopIndex]
        const etas: { busIndex: number, eta: number }[] = []

        routeObj.busSteps.forEach((busStep, busIndex) => {
            const eta = computeETAToStop(routeObj.path!, busStep, stopStep)
            if (eta > 0) { // Solo incluir buses que aún no han pasado
                etas.push({ busIndex, eta })
            }
        })

        // Ordenar por ETA (el más cercano primero)
        return etas.sort((a, b) => a.eta - b.eta)
    }

    useEffect(() => {
        if (scriptLoadedRef.current) {
            if (window.google && window.google.maps) initMap()
            return
        }

        const loadMap = () => {
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
            if (existingScript) {
                existingScript.addEventListener('load', initMap)
                return
            }

            const script = document.createElement("script")
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBJid6cm7TqtvO1c0B0b9tOKfZNbA6l6Ho&libraries=geometry`
            script.async = true
            script.defer = true
            script.onload = () => {
                scriptLoadedRef.current = true
                if (window.google && window.google.maps) initMap()
                else setError("Google Maps no se cargó correctamente")
            }
            script.onerror = () => setError("Error al cargar Google Maps")
            document.head.appendChild(script)
        }

        const initMap = () => {
            if (!mapRef.current || !window.google || !window.google.maps) {
                setError("Google Maps no definido")
                setLoading(false)
                return
            }

            const map = new window.google.maps.Map(mapRef.current, {
                center: stops1[0],
                zoom: 14,
                mapTypeId: "roadmap"
            })

            const infoWindow = new window.google.maps.InfoWindow()

            setupRoute(stops1, "#4285F4", route1.current, map, 2, infoWindow, "Ruta 1")
            setupRoute(stops2, "#0F9D58", route2.current, map, 2, infoWindow, "Ruta 2")

            setLoading(false)
        }

        loadMap()
    }, [])

    const setupRoute = (
        stops: LatLng[],
        color: string,
        routeObj: RouteObj,
        map: google.maps.Map,
        busesCount: number,
        infoWindow: google.maps.InfoWindow,
        routeName: string
    ) => {
        if (!window.google || stops.length < 2) return

        const directionsService = new window.google.maps.DirectionsService()
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: { strokeColor: color, strokeWeight: 5 }
        })
        routeObj.directionsRenderer = directionsRenderer

        const origin = stops[0]
        const destination = stops[stops.length - 1]
        const waypoints = stops.slice(1, -1).map(s => ({ location: s }))

        directionsService.route(
            { origin, destination, waypoints, travelMode: window.google.maps.TravelMode.DRIVING },
            (result, status) => {
                if (status === "OK" && result) {
                    directionsRenderer.setDirections(result)
                    routeObj.path = result.routes[0].overview_path
                    routeObj.busSteps = []
                    routeObj.stopSteps = []

                    // Encontrar los pasos más cercanos para cada parada
                    stops.forEach(stop => {
                        const closestStep = findClosestStepToStop(routeObj.path!, stop)
                        routeObj.stopSteps!.push(closestStep)
                    })

                    // Marcadores de paradas
                    stops.forEach((stop, stopIdx) => {
                        const marker = new window.google.maps.Marker({
                            position: stop,
                            map,
                            title: stop.name,
                            icon: {
                                url: "https://maps.gstatic.com/mapfiles/transit/iw2/6/bus.png",
                                scaledSize: new google.maps.Size(28, 28)
                            }
                        })

                        marker.addListener("click", () => {
                            const etas = getETAsForStop(routeObj, stopIdx, stops)

                            let content = `<div style="min-width: 200px;">
                                <h3 style="margin: 0 0 10px 0; color: ${color}; font-size: 16px;">
                                    <strong>${stop.name}</strong>
                                </h3>
                                <div style="font-size: 14px;">`

                            if (etas.length > 0) {
                                content += `<strong>Próximos buses:</strong><br>`
                                etas.slice(0, 3).forEach((eta, index) => {
                                    const minutes = Math.ceil(eta.eta)
                                    const timeText = minutes <= 1 ? "Llegando" : `${minutes} min`
                                    content += `• Bus ${eta.busIndex + 1}: <span style="color: ${color}; font-weight: bold;">${timeText}</span><br>`
                                })
                                if (etas.length > 3) {
                                    content += `<small style="color: #666;">... y ${etas.length - 3} más</small>`
                                }
                            } else {
                                content += `<span style="color: #666;">No hay buses próximos</span>`
                            }

                            content += `</div></div>`

                            infoWindow.setContent(content)
                            infoWindow.open(map, marker)
                        })
                    })

                    // Crear buses
                    routeObj.busMarkers = []
                    const pathLength = routeObj.path.length

                    for (let b = 0; b < busesCount; b++) {
                        // Distribuir buses uniformemente en la ruta
                        const initialStep = Math.floor((pathLength / busesCount) * b)

                        const busMarker = new window.google.maps.Marker({
                            position: routeObj.path[initialStep],
                            map,
                            title: `${routeName} - Bus ${b + 1}`,
                            icon: {
                                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                scale: 6,
                                strokeColor: color,
                                fillColor: color,
                                fillOpacity: 0.8
                            }
                        })

                        routeObj.busSteps!.push(initialStep)
                        routeObj.busMarkers.push(busMarker)

                        // Simulación de movimiento mejorada
                        let step = initialStep
                        const baseSpeed = 5.55 // m/s
                        const stopWaitTime = 30 * 1000 // 30 segundos en paradas

                        const moveBus = () => {
                            const path = routeObj.path!
                            const nextStep = (step + 1) % path.length
                            const start = path[step]
                            const end = path[nextStep]

                            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                                new window.google.maps.LatLng(start),
                                new window.google.maps.LatLng(end)
                            )

                            const duration = distance / baseSpeed * 1000

                            // Actualizar posición del bus
                            busMarker.setPosition(end)
                            step = nextStep
                            routeObj.busSteps![b] = step

                            // Verificar si está en una parada
                            const isAtStop = routeObj.stopSteps!.some(stopStep =>
                                Math.abs(step - stopStep) <= 2 // Tolerancia de 2 pasos
                            )

                            // Programar siguiente movimiento
                            const nextMoveDelay = isAtStop ? stopWaitTime : Math.max(duration, 1000)
                            setTimeout(moveBus, nextMoveDelay)
                        }

                        // Iniciar movimiento con un pequeño retraso escalonado
                        setTimeout(moveBus, b * 2000)
                    }
                } else {
                    console.error("Error al generar la ruta", status)
                }
            }
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mapa de Rutas</CardTitle>
                    <CardDescription>Error al cargar el mapa</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500 p-4 text-center">{error}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mapa de Rutas</CardTitle>
                <CardDescription>Visualiza las rutas y ubicación de los buses en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p>Cargando mapa...</p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} style={{ width: "100%", height: "500px", display: loading ? "none" : "block" }} />
            </CardContent>
        </Card>
    )
}