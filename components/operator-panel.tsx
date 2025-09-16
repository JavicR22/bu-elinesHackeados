"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, DollarSign, CreditCard } from "lucide-react"

interface Payment {
  id: string
  route: string
  amount: number
  method: string
  timestamp: string
  status: "completed" | "pending" | "failed"
}

export default function OperatorPanel() {
  const [routes, setRoutes] = useState([
    {
      id: "1",
      name: "Ruta Original",
      origin: "San Antonio",
      destination: "Hospital Departamental",
      fare: 2500,
      status: "active",
    },
    {
      id: "2",
      name: "Ruta Nueva",
      origin: "Plaza Los Libertadores",
      destination: "Terminalito",
      fare: 2000,
      status: "active",
    },
  ])

  const [payments] = useState([
    {
      id: "1",
      route: "Ruta Original",
      amount: 2500,
      method: "Nequi",
      timestamp: "2024-01-15 14:30",
      status: "completed",
    },
    { id: "2", route: "Ruta Nueva", amount: 2000, method: "Nequi", timestamp: "2024-01-15 14:25", status: "completed" },
    {
      id: "3",
      route: "Ruta Original",
      amount: 2500,
      method: "Nequi",
      timestamp: "2024-01-15 14:20",
      status: "pending",
    },
  ])

  const [newRoute, setNewRoute] = useState({
    name: "",
    origin: "",
    destination: "",
    fare: "",
  })

  const [editingRoute, setEditingRoute] = useState<string | null>(null)

  const handleAddRoute = () => {
    if (newRoute.name && newRoute.origin && newRoute.destination && newRoute.fare) {
      const route = {
        id: Date.now().toString(),
        name: newRoute.name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        fare: Number.parseFloat(newRoute.fare),
        status: "active",
      }
      setRoutes([...routes, route])
      setNewRoute({ name: "", origin: "", destination: "", fare: "" })
    }
  }

  const handleEditRoute = (id: string, updatedRoute: any) => {
    setRoutes(routes.map((route) => (route.id === id ? { ...route, ...updatedRoute } : route)))
    setEditingRoute(null)
  }

  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Panel del Operador</h2>
          <p className="text-muted-foreground">Gestiona rutas y consulta pagos digitales</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.filter((r) => r.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Digitales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Gestión de Rutas</TabsTrigger>
          <TabsTrigger value="payments">Pagos Digitales</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Ruta</CardTitle>
              <CardDescription>Agrega una nueva ruta al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Nombre de la Ruta</Label>
                  <Input
                    id="routeName"
                    placeholder="Ej: Ruta Centro"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fare">Tarifa (COP)</Label>
                  <Input
                    id="fare"
                    type="number"
                    placeholder="2500"
                    value={newRoute.fare}
                    onChange={(e) => setNewRoute({ ...newRoute, fare: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origen</Label>
                  <Input
                    id="origin"
                    placeholder="Punto de inicio"
                    value={newRoute.origin}
                    onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input
                    id="destination"
                    placeholder="Punto final"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddRoute} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Crear Ruta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rutas Existentes</CardTitle>
              <CardDescription>Gestiona las rutas del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Tarifa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>{route.origin}</TableCell>
                      <TableCell>{route.destination}</TableCell>
                      <TableCell>${route.fare.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={route.status === "active" ? "default" : "secondary"}>
                          {route.status === "active" ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setEditingRoute(route.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos Digitales</CardTitle>
              <CardDescription>Consulta todos los pagos realizados por los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono">{payment.id}</TableCell>
                      <TableCell>{payment.route}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.timestamp}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {payment.status === "completed"
                            ? "Completado"
                            : payment.status === "pending"
                              ? "Pendiente"
                              : "Fallido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
