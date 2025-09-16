"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Settings,
  Bus,
  CreditCard,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import Link from "next/link"

export default function OperatorDashboard() {
  const [stats] = useState({
    activeRoutes: 12,
    totalVehicles: 45,
    dailyRevenue: 2450000,
    activePassengers: 1250,
    pendingPayments: 15,
    systemAlerts: 3,
  })

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
              <Settings className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">Panel de Operador</h1>
                <p className="text-sm opacity-90">Sistema de Gestión de Transporte</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Bus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeRoutes}</p>
                  <p className="text-sm text-muted-foreground">Rutas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activePassengers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pasajeros Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${(stats.dailyRevenue / 1000).toFixed(0)}K</p>
                  <p className="text-sm text-muted-foreground">Ingresos Diarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.systemAlerts}</p>
                  <p className="text-sm text-muted-foreground">Alertas Sistema</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="routes">Gestión de Rutas</TabsTrigger>
            <TabsTrigger value="payments">Pagos Digitales</TabsTrigger>
            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="routes">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Rutas y Tarifas</h2>
                <Link href="/operator/routes/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Ruta
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    id: "1",
                    name: "Ruta 15 - Centro",
                    origin: "Macarena",
                    destination: "Terminal",
                    price: 2500,
                    status: "active",
                    vehicles: 4,
                    dailyTrips: 48,
                  },
                  {
                    id: "2",
                    name: "Ruta 8 - Directo",
                    origin: "Barzal",
                    destination: "Centro Comercial",
                    price: 2500,
                    status: "active",
                    vehicles: 3,
                    dailyTrips: 36,
                  },
                  {
                    id: "3",
                    name: "Ruta 22 - Expreso",
                    origin: "Norte",
                    destination: "Terminal Sur",
                    price: 3000,
                    status: "maintenance",
                    vehicles: 2,
                    dailyTrips: 24,
                  },
                ].map((route) => (
                  <Card key={route.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{route.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {route.origin} → {route.destination}
                          </p>
                        </div>
                        <Badge variant={route.status === "active" ? "default" : "secondary"}>
                          {route.status === "active" ? "Activa" : "Mantenimiento"}
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Tarifa</p>
                          <p className="text-lg font-bold text-primary">${route.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Vehículos</p>
                          <p className="text-lg font-bold">{route.vehicles}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Viajes Diarios</p>
                          <p className="text-lg font-bold">{route.dailyTrips}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ingresos Est.</p>
                          <p className="text-lg font-bold">${((route.price * route.dailyTrips) / 1000).toFixed(0)}K</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/operator/routes/${route.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                        <Link href={`/operator/routes/${route.id}/schedule`}>
                          <Button variant="outline" size="sm">
                            Ver Horarios
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Pagos Digitales</h2>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar</Button>
                  <Button>Configurar Tarifas</Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <CreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">$1.2M</p>
                        <p className="text-sm text-muted-foreground">Pagos Hoy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">485</p>
                        <p className="text-sm text-muted-foreground">Transacciones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                        <p className="text-sm text-muted-foreground">Pendientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Transacciones Recientes</CardTitle>
                  <CardDescription>Últimos pagos digitales procesados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "TXN001",
                        user: "Juan Pérez",
                        route: "Ruta 15 - Centro",
                        amount: 2500,
                        method: "Nequi",
                        status: "completed",
                        time: "10:30 AM",
                      },
                      {
                        id: "TXN002",
                        user: "María García",
                        route: "Ruta 8 - Directo",
                        amount: 2500,
                        method: "Nequi",
                        status: "completed",
                        time: "10:25 AM",
                      },
                      {
                        id: "TXN003",
                        user: "Carlos López",
                        route: "Ruta 22 - Expreso",
                        amount: 3000,
                        method: "Nequi",
                        status: "pending",
                        time: "10:20 AM",
                      },
                    ].map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.user}</p>
                            <p className="text-sm text-muted-foreground">{transaction.route}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${transaction.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={transaction.status === "completed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {transaction.status === "completed" ? "Completado" : "Pendiente"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{transaction.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vehicles">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestión de Vehículos</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Vehículo
                </Button>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    id: "BUS001",
                    plate: "ABC-123",
                    route: "Ruta 15 - Centro",
                    driver: "Pedro Martínez",
                    status: "active",
                    location: "Universidad",
                    fuel: 85,
                    passengers: 28,
                    capacity: 40,
                  },
                  {
                    id: "BUS002",
                    plate: "DEF-456",
                    route: "Ruta 8 - Directo",
                    driver: "Ana Rodríguez",
                    status: "active",
                    location: "Terminal",
                    fuel: 62,
                    passengers: 35,
                    capacity: 40,
                  },
                  {
                    id: "BUS003",
                    plate: "GHI-789",
                    route: "Ruta 22 - Expreso",
                    driver: "Luis González",
                    status: "maintenance",
                    location: "Taller",
                    fuel: 0,
                    passengers: 0,
                    capacity: 45,
                  },
                ].map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{vehicle.id}</h3>
                            <p className="text-sm text-muted-foreground">Placa: {vehicle.plate}</p>
                          </div>
                        </div>
                        <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>
                          {vehicle.status === "active" ? "Activo" : "Mantenimiento"}
                        </Badge>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Ruta Asignada</p>
                          <p className="text-sm text-muted-foreground">{vehicle.route}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Conductor</p>
                          <p className="text-sm text-muted-foreground">{vehicle.driver}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ubicación</p>
                          <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ocupación</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.passengers}/{vehicle.capacity}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Combustible</span>
                          <span className="text-sm text-muted-foreground">{vehicle.fuel}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              vehicle.fuel > 50 ? "bg-green-500" : vehicle.fuel > 25 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${vehicle.fuel}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                        <Button variant="outline" size="sm">
                          Historial
                        </Button>
                        {vehicle.status === "active" && (
                          <Button variant="outline" size="sm">
                            Rastrear
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
                <div className="flex gap-2">
                  <Button variant="outline">Exportar PDF</Button>
                  <Button variant="outline">Exportar Excel</Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Ruta</CardTitle>
                    <CardDescription>Últimos 7 días</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { route: "Ruta 15 - Centro", revenue: 450000, percentage: 35 },
                        { route: "Ruta 8 - Directo", revenue: 380000, percentage: 30 },
                        { route: "Ruta 22 - Expreso", revenue: 280000, percentage: 22 },
                        { route: "Otras rutas", revenue: 165000, percentage: 13 },
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.route}</span>
                            <span className="text-sm text-muted-foreground">
                              ${(item.revenue / 1000).toFixed(0)}K ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 bg-primary rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                    <CardDescription>Distribución actual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { method: "Nequi", count: 285, percentage: 65 },
                        { method: "Efectivo", count: 120, percentage: 27 },
                        { method: "Tarjeta", count: 35, percentage: 8 },
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.method}</span>
                            <span className="text-sm text-muted-foreground">
                              {item.count} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 bg-secondary rounded-full transition-all"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen Operacional</CardTitle>
                  <CardDescription>Métricas clave del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">98.5%</p>
                      <p className="text-sm text-muted-foreground">Puntualidad</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">4.2/5</p>
                      <p className="text-sm text-muted-foreground">Satisfacción</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">1,250</p>
                      <p className="text-sm text-muted-foreground">Usuarios Activos</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">45</p>
                      <p className="text-sm text-muted-foreground">Vehículos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
