"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Bus, MapPin, Clock, Search, Zap } from "lucide-react"
import Link from "next/link"

interface LiveVehicle {
  id: string
  routeName: string
  currentStop: string
  nextStop: string
  estimatedArrival: string
  occupancy: number
  maxCapacity: number
  status: "on-time" | "delayed" | "early"
  lastUpdate: string
}

export default function RealTimePage() {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate real-time data fetching
    const fetchVehicles = () => {
      const mockVehicles: LiveVehicle[] = [
        {
          id: "BUS001",
          routeName: "Ruta 15 - Centro",
          currentStop: "Universidad Cooperativa",
          nextStop: "Centro Comercial Unicentro",
          estimatedArrival: "3 min",
          occupancy: 28,
          maxCapacity: 40,
          status: "on-time",
          lastUpdate: "Hace 30 seg",
        },
        {
          id: "BUS002",
          routeName: "Ruta 8 - Directo",
          currentStop: "Terminal de Transporte",
          nextStop: "Estadio Bello Horizonte",
          estimatedArrival: "7 min",
          occupancy: 35,
          maxCapacity: 40,
          status: "delayed",
          lastUpdate: "Hace 1 min",
        },
        {
          id: "BUS003",
          routeName: "Ruta 22 - Expreso",
          currentStop: "Centro",
          nextStop: "Macarena",
          estimatedArrival: "2 min",
          occupancy: 15,
          maxCapacity: 45,
          status: "early",
          lastUpdate: "Hace 15 seg",
        },
        {
          id: "BUS004",
          routeName: "Ruta 12 - Norte",
          currentStop: "Barzal Alto",
          nextStop: "Centro Norte",
          estimatedArrival: "5 min",
          occupancy: 22,
          maxCapacity: 40,
          status: "on-time",
          lastUpdate: "Hace 45 seg",
        },
      ]
      setVehicles(mockVehicles)
      setIsLoading(false)
    }

    fetchVehicles()

    // Update every 30 seconds
    const interval = setInterval(fetchVehicles, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.currentStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.nextStop.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const getOccupancyColor = (occupancy: number, maxCapacity: number) => {
    const percentage = (occupancy / maxCapacity) * 100
    if (percentage < 50) return "bg-green-500"
    if (percentage < 80) return "bg-yellow-500"
    return "bg-red-500"
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
              <Zap className="h-6 w-6" />
              <h1 className="text-xl font-bold">Tiempo Real</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Stats */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ruta o parada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Bus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vehicles.filter((v) => v.status === "on-time").length}</p>
                    <p className="text-sm text-muted-foreground">A tiempo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vehicles.filter((v) => v.status === "delayed").length}</p>
                    <p className="text-sm text-muted-foreground">Retrasados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{vehicles.length}</p>
                    <p className="text-sm text-muted-foreground">Buses activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Vehicles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Buses en Vivo</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Actualizando en tiempo real
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.routeName}</h3>
                          <p className="text-sm text-muted-foreground">Bus #{vehicle.id}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(vehicle.status)}>{getStatusLabel(vehicle.status)}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Ubicación actual:</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vehicle.currentStop}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Próxima parada:</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {vehicle.nextStop} - {vehicle.estimatedArrival}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Ocupación</span>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.occupancy}/{vehicle.maxCapacity} pasajeros
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getOccupancyColor(vehicle.occupancy, vehicle.maxCapacity)}`}
                            style={{ width: `${(vehicle.occupancy / vehicle.maxCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Última actualización: {vehicle.lastUpdate}
                        </span>
                        <Link href={`/maps?vehicle=${vehicle.id}`}>
                          <Button variant="outline" size="sm">
                            Ver en Mapa
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredVehicles.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron buses</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay buses activos en este momento"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
