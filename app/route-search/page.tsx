"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Bus, ArrowLeft, Navigation, Route, Users } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  id: string
  routeName: string
  origin: string
  destination: string
  estimatedTime: string
  price: string
  status: "active" | "delayed" | "inactive"
  nextArrival: string
  stops: string[]
  walkingTime: string
  nearestStop: string
}

export default function RouteSearchPage() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simulate getting user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setOrigin("Tu ubicación actual")
        },
        (error) => {
          console.log("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleSearch = async () => {
    if (!destination.trim()) return

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          routeName: "Ruta 15 - Centro",
          origin: "Estación Macarena",
          destination: "Terminal de Transporte",
          estimatedTime: "25 min",
          price: "$2,500",
          status: "active",
          nextArrival: "3 min",
          stops: ["Macarena", "Universidad", "Centro", "Terminal"],
          walkingTime: "5 min",
          nearestStop: "Estación Macarena",
        },
        {
          id: "2",
          routeName: "Ruta 8 - Directo",
          origin: "Estación Barzal",
          destination: "Centro Comercial",
          estimatedTime: "18 min",
          price: "$2,500",
          status: "active",
          nextArrival: "7 min",
          stops: ["Barzal", "Estadio", "Centro Comercial"],
          walkingTime: "8 min",
          nearestStop: "Estación Barzal",
        },
        {
          id: "3",
          routeName: "Ruta 22 - Expreso",
          origin: "Estación Norte",
          destination: "Terminal Sur",
          estimatedTime: "35 min",
          price: "$3,000",
          status: "delayed",
          nextArrival: "12 min",
          stops: ["Norte", "Centro", "Universidad", "Terminal Sur"],
          walkingTime: "3 min",
          nearestStop: "Estación Norte",
        },
      ]
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 1500)
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
              <Route className="h-6 w-6" />
              <h1 className="text-xl font-bold">Buscar Ruta</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Planifica tu Viaje</CardTitle>
            <CardDescription>Encuentra la mejor ruta y conoce los tiempos de llegada en tiempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origen</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tu ubicación actual"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {userLocation && (
                  <p className="text-xs text-muted-foreground">📍 Ubicación detectada automáticamente</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destino</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="¿A dónde quieres ir?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleSearch} className="w-full" size="lg" disabled={isSearching || !destination.trim()}>
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Buscando rutas...
                </>
              ) : (
                <>
                  <Route className="h-4 w-4 mr-2" />
                  Buscar Rutas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Rutas Encontradas</h2>
              <Badge variant="secondary">{searchResults.length} opciones</Badge>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{result.routeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {result.origin} → {result.destination}
                          </p>
                        </div>
                      </div>
                      <Badge variant={result.status === "active" ? "default" : "secondary"}>
                        {result.status === "active" ? "Activo" : "Retrasado"}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{result.estimatedTime}</p>
                          <p className="text-xs text-muted-foreground">Tiempo total</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{result.walkingTime}</p>
                          <p className="text-xs text-muted-foreground">Caminata</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{result.price}</p>
                          <p className="text-xs text-muted-foreground">Tarifa</p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Estación más cercana:</p>
                        <p className="text-sm text-muted-foreground">{result.nearestStop}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Paradas:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.stops.map((stop, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {stop}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-600">
                            Próximo bus en {result.nextArrival}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/maps?route=${result.id}`}>
                            <Button variant="outline" size="sm">
                              Ver en Mapa
                            </Button>
                          </Link>
                          <Link href={`/payment?route=${result.id}`}>
                            <Button size="sm">Pagar Viaje</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isSearching && destination && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron rutas</h3>
              <p className="text-muted-foreground mb-4">Intenta con un destino diferente o verifica la ortografía</p>
              <Button variant="outline" onClick={() => setDestination("")}>
                Limpiar búsqueda
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
