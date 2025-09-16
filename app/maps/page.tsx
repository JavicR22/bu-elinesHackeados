"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Bus, Locate, Search } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// Google Maps types
declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface BusLocation {
  id: string
  routeName: string
  lat: number
  lng: number
  heading: number
  speed: number
  occupancy: number
  status: "active" | "delayed" | "stopped"
}

interface RouteStop {
  id: string
  name: string
  lat: number
  lng: number
  order: number
}

export default function MapsPage() {
  const searchParams = useSearchParams()
  const routeId = searchParams.get("route")
  const vehicleId = searchParams.get("vehicle")

  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [busLocations, setBusLocations] = useState<BusLocation[]>([])
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [selectedBus, setSelectedBus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Villavicencio coordinates
  const villavicencioCenter = { lat: 4.142, lng: -73.6266 }

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    try {
      if (!window.google || !document.getElementById("map")) return

      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: villavicencioCenter,
        zoom: 13,
        styles: [
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      setMap(mapInstance)
      setIsLoaded(true)

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setUserLocation(userPos)

            // Add user location marker
            new window.google.maps.Marker({
              position: userPos,
              map: mapInstance,
              title: "Tu ubicación",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            })
          },
          (error) => {
            console.log("Error getting location:", error)
          },
        )
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setLoadError("Error al cargar el mapa")
    }
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      initializeMap()
      return
    }

    window.initMap = initializeMap

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBJid6cm7TqtvO1c0B0b9tOKfZNbA6l6Ho&callback=initMap&libraries=geometry,places`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [initializeMap])

  // Mock data for buses and stops
  useEffect(() => {
    const mockBuses: BusLocation[] = [
      {
        id: "BUS001",
        routeName: "Ruta 15 - Centro",
        lat: 4.1435,
        lng: -73.6255,
        heading: 45,
        speed: 25,
        occupancy: 28,
        status: "active",
      },
      {
        id: "BUS002",
        routeName: "Ruta 8 - Directo",
        lat: 4.1398,
        lng: -73.6289,
        heading: 180,
        speed: 0,
        occupancy: 35,
        status: "stopped",
      },
      {
        id: "BUS003",
        routeName: "Ruta 22 - Expreso",
        lat: 4.1456,
        lng: -73.6234,
        heading: 270,
        speed: 30,
        occupancy: 15,
        status: "active",
      },
    ]

    const mockStops: RouteStop[] = [
      { id: "STOP001", name: "Terminal de Transporte", lat: 4.1421, lng: -73.6267, order: 1 },
      { id: "STOP002", name: "Centro Comercial Unicentro", lat: 4.1445, lng: -73.6245, order: 2 },
      { id: "STOP003", name: "Universidad Cooperativa", lat: 4.1467, lng: -73.6223, order: 3 },
      { id: "STOP004", name: "Macarena", lat: 4.1489, lng: -73.6201, order: 4 },
      { id: "STOP005", name: "Estadio Bello Horizonte", lat: 4.1398, lng: -73.6289, order: 5 },
    ]

    setBusLocations(mockBuses)
    setRouteStops(mockStops)
  }, [])

  // Add markers to map
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers (in a real app, you'd manage this better)
    // Add bus markers
    busLocations.forEach((bus) => {
      const busIcon = {
        path: "M12 2C13.1 2 14 2.9 14 4V6H18C18.6 6 19 6.4 19 7V17H17V19C17 19.6 16.6 20 16 20H15C14.4 20 14 19.6 14 19V17H10V19C10 19.6 9.6 20 9 20H8C7.4 20 7 19.6 7 19V17H5V7C5 6.4 5.4 6 6 6H10V4C10 2.9 10.9 2 12 2M12 4V6H12V4M7 8V10H9V8H7M15 8V10H17V8H15M7 11V13H9V11H7M15 11V13H17V11H15Z",
        fillColor: bus.status === "active" ? "#059669" : bus.status === "delayed" ? "#f59e0b" : "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 12),
        rotation: bus.heading,
      }

      const marker = new window.google.maps.Marker({
        position: { lat: bus.lat, lng: bus.lng },
        map: map,
        title: `${bus.routeName} - ${bus.id}`,
        icon: busIcon,
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${bus.routeName}</h3>
            <p class="text-sm text-gray-600">Bus: ${bus.id}</p>
            <p class="text-sm">Velocidad: ${bus.speed} km/h</p>
            <p class="text-sm">Ocupación: ${bus.occupancy} pasajeros</p>
            <p class="text-sm">Estado: ${bus.status === "active" ? "Activo" : bus.status === "delayed" ? "Retrasado" : "Detenido"}</p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
        setSelectedBus(bus.id)
      })
    })

    // Add stop markers
    routeStops.forEach((stop) => {
      const stopIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      }

      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: map,
        title: stop.name,
        icon: stopIcon,
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${stop.name}</h3>
            <p class="text-sm text-gray-600">Parada #${stop.order}</p>
          </div>
        `,
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })
    })
  }, [map, isLoaded, busLocations, routeStops])

  // Focus on specific vehicle if provided
  useEffect(() => {
    if (vehicleId && map && busLocations.length > 0) {
      const bus = busLocations.find((b) => b.id === vehicleId)
      if (bus) {
        map.setCenter({ lat: bus.lat, lng: bus.lng })
        map.setZoom(16)
        setSelectedBus(bus.id)
      }
    }
  }, [vehicleId, map, busLocations])

  const centerOnUser = () => {
    if (userLocation && map) {
      map.setCenter(userLocation)
      map.setZoom(16)
    }
  }

  const searchLocation = async () => {
    if (!searchQuery || !map || !window.google) return

    const service = new window.google.maps.places.PlacesService(map)
    const request = {
      query: `${searchQuery} Villavicencio`,
      fields: ["name", "geometry"],
    }

    service.textSearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0]
        map.setCenter(place.geometry.location)
        map.setZoom(16)

        new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name,
        })
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              <h1 className="text-xl font-bold">Mapa en Tiempo Real</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-background border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchLocation()}
              />
              <Button onClick={searchLocation} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={centerOnUser} variant="outline" size="sm" className="flex-1 bg-transparent">
                <Locate className="h-4 w-4 mr-2" />
                Mi ubicación
              </Button>
            </div>

            {/* Active Buses */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Buses Activos</CardTitle>
                <CardDescription>Vehículos en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {busLocations.map((bus) => (
                  <div
                    key={bus.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBus === bus.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      if (map) {
                        map.setCenter({ lat: bus.lat, lng: bus.lng })
                        map.setZoom(16)
                        setSelectedBus(bus.id)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{bus.id}</span>
                      </div>
                      <Badge
                        variant={
                          bus.status === "active" ? "default" : bus.status === "delayed" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {bus.status === "active" ? "Activo" : bus.status === "delayed" ? "Retrasado" : "Detenido"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{bus.routeName}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{bus.speed} km/h</span>
                      <span>{bus.occupancy} pasajeros</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Route Stops */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Paradas</CardTitle>
                <CardDescription>Estaciones principales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {routeStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      if (map) {
                        map.setCenter({ lat: stop.lat, lng: stop.lng })
                        map.setZoom(17)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {stop.order}
                      </div>
                      <span className="text-sm font-medium">{stop.name}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Leyenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Bus activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Bus retrasado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Bus detenido</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Parada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Tu ubicación</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div id="map" className="w-full h-full">
            {!isLoaded && !loadError && (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando mapa...</p>
                </div>
              </div>
            )}
            {loadError && (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-muted-foreground">{loadError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button onClick={centerOnUser} size="sm" className="shadow-lg">
              <Locate className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
