"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Bus, MapPin, Clock, Search } from "lucide-react"
import Link from "next/link"

interface RouteInfo {
  id: string
  name: string
  origin: string
  destination: string
  estimatedTime: string
  price: string
  status: "active" | "delayed" | "inactive"
  frequency: string
  operatingHours: string
  stops: string[]
  category: "urbano" | "intermunicipal" | "expreso"
}

export default function RoutesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const routes: RouteInfo[] = [
    {
      id: "1",
      name: "Ruta 15 - Centro",
      origin: "Macarena",
      destination: "Terminal",
      estimatedTime: "25 min",
      price: "$2,500",
      status: "active",
      frequency: "Cada 10 min",
      operatingHours: "5:00 AM - 10:00 PM",
      stops: ["Macarena", "Universidad", "Centro", "Terminal"],
      category: "urbano",
    },
    {
      id: "2",
      name: "Ruta 8 - Directo",
      origin: "Barzal",
      destination: "Centro Comercial",
      estimatedTime: "18 min",
      price: "$2,500",
      status: "active",
      frequency: "Cada 8 min",
      operatingHours: "6:00 AM - 9:00 PM",
      stops: ["Barzal", "Estadio", "Centro Comercial"],
      category: "urbano",
    },
    {
      id: "3",
      name: "Ruta 22 - Expreso",
      origin: "Norte",
      destination: "Terminal Sur",
      estimatedTime: "35 min",
      price: "$3,000",
      status: "delayed",
      frequency: "Cada 15 min",
      operatingHours: "5:30 AM - 11:00 PM",
      stops: ["Norte", "Centro", "Universidad", "Terminal Sur"],
      category: "expreso",
    },
    {
      id: "4",
      name: "Ruta Acacías",
      origin: "Terminal Villavicencio",
      destination: "Acacías",
      estimatedTime: "45 min",
      price: "$4,500",
      status: "active",
      frequency: "Cada 30 min",
      operatingHours: "5:00 AM - 8:00 PM",
      stops: ["Terminal", "Peaje", "Acacías Centro"],
      category: "intermunicipal",
    },
    {
      id: "5",
      name: "Ruta Granada",
      origin: "Terminal Villavicencio",
      destination: "Granada",
      estimatedTime: "60 min",
      price: "$6,000",
      status: "active",
      frequency: "Cada 45 min",
      operatingHours: "6:00 AM - 7:00 PM",
      stops: ["Terminal", "San Martín", "Granada"],
      category: "intermunicipal",
    },
  ]

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || route.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "urbano":
        return "Urbano"
      case "intermunicipal":
        return "Intermunicipal"
      case "expreso":
        return "Expreso"
      default:
        return "Todas"
    }
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
              <Bus className="h-6 w-6" />
              <h1 className="text-xl font-bold">Todas las Rutas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rutas, origen o destino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="urbano">Urbano</TabsTrigger>
                  <TabsTrigger value="expreso">Expreso</TabsTrigger>
                  <TabsTrigger value="intermunicipal">Inter.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Routes Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "Todas las Rutas" : `Rutas ${getCategoryLabel(selectedCategory)}`}
            </h2>
            <Badge variant="secondary">{filteredRoutes.length} rutas</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoutes.map((route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {route.origin} → {route.destination}
                      </CardDescription>
                    </div>
                    <Badge variant={route.status === "active" ? "default" : "secondary"}>
                      {route.status === "active" ? "Activo" : "Retrasado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Tiempo</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.estimatedTime}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Tarifa</p>
                      <p className="text-muted-foreground">{route.price}</p>
                    </div>
                    <div>
                      <p className="font-medium">Frecuencia</p>
                      <p className="text-muted-foreground">{route.frequency}</p>
                    </div>
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-muted-foreground text-xs">{route.operatingHours}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-sm mb-2">Paradas principales:</p>
                    <div className="flex flex-wrap gap-1">
                      {route.stops.slice(0, 3).map((stop, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {stop}
                        </Badge>
                      ))}
                      {route.stops.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{route.stops.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/route-search?route=${route.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Link href={`/payment?route=${route.id}`}>
                      <Button size="sm">Pagar</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRoutes.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron rutas</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay rutas disponibles en esta categoría"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                >
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
