"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation, CreditCard, Smartphone } from "lucide-react"
import GoogleMapsComponent from "@/components/google-maps"
import PaymentModal from "@/components/payment-modal"
import LocationTracker from "@/components/location-tracker"

interface Stop {
  lat: number
  lng: number
  name: string
  routes: string[]
  estimatedTime?: number
}

interface Route {
  id: string
  name: string
  fare: number
  color: string
}

export default function PassengerPanel() {
  const [destination, setDestination] = useState("")
  const [nearestStop, setNearestStop] = useState<Stop | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const stops: Stop[] = [
    { lat: 4.119962, lng: -73.565602, name: "San Antonio", routes: ["Ruta Original"], estimatedTime: 5 },
    { lat: 4.128293, lng: -73.568883, name: "Camino Ganadero", routes: ["Ruta Original"], estimatedTime: 8 },
    { lat: 4.132105, lng: -73.565558, name: "Hotel Campanario", routes: ["Ruta Original"], estimatedTime: 12 },
    { lat: 4.138859, lng: -73.594127, name: "Avenida Catama", routes: ["Ruta Original"], estimatedTime: 15 },
    { lat: 4.149229, lng: -73.628838, name: "Hotel Rosada", routes: ["Ruta Original"], estimatedTime: 18 },
    { lat: 4.149261, lng: -73.635636, name: "Parque del Hacha", routes: ["Ruta Original"], estimatedTime: 20 },
    { lat: 4.146947, lng: -73.636648, name: "Parque de los estudiantes", routes: ["Ruta Original"], estimatedTime: 22 },
    { lat: 4.145018, lng: -73.637844, name: "Fiscalia", routes: ["Ruta Original"], estimatedTime: 25 },
    { lat: 4.143767, lng: -73.637424, name: "Clinica Meta", routes: ["Ruta Original"], estimatedTime: 27 },
    { lat: 4.146866, lng: -73.639007, name: "Clinica Martha", routes: ["Ruta Original"], estimatedTime: 30 },
    { lat: 4.149313, lng: -73.63925, name: "Clinica San Ignacio", routes: ["Ruta Original"], estimatedTime: 32 },
    { lat: 4.145927, lng: -73.642055, name: "Calle 37", routes: ["Ruta Original"], estimatedTime: 35 },
    { lat: 4.144459, lng: -73.643422, name: "Hospital Departamental", routes: ["Ruta Original"], estimatedTime: 38 },
    { lat: 4.142572, lng: -73.629326, name: "Plaza Los Libertadores", routes: ["Ruta Nueva"], estimatedTime: 3 },
    { lat: 4.14466, lng: -73.6284, name: "Catedral", routes: ["Ruta Nueva"], estimatedTime: 7 },
    { lat: 4.14652, lng: -73.62705, name: "Parque Infantil", routes: ["Ruta Nueva"], estimatedTime: 10 },
    { lat: 4.14989, lng: -73.62625, name: "Siete de Agosto", routes: ["Ruta Nueva"], estimatedTime: 13 },
    { lat: 4.1521, lng: -73.6248, name: "Terminalito", routes: ["Ruta Nueva"], estimatedTime: 16 },
  ]

  const routes: Route[] = [
    { id: "1", name: "Ruta Original", fare: 2500, color: "blue" },
    { id: "2", name: "Ruta Nueva", fare: 2000, color: "green" },
  ]

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route)
    setShowPayment(true)
  }

  const handleNearestStopChange = (stop: Stop | null) => {
    setNearestStop(stop)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Panel del Pasajero</h2>
          <p className="text-muted-foreground">Encuentra tu ruta y realiza pagos digitales</p>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Buscar Ruta</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="payment">Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {/* Location Tracker */}
          <LocationTracker stops={stops} onNearestStopChange={handleNearestStopChange} />

          {/* Destination Search */}
          <Card>
            <CardHeader>
              <CardTitle>¿A dónde quieres ir?</CardTitle>
              <CardDescription>Ingresa tu destino para encontrar la mejor ruta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Ej: Hospital Departamental, Centro, Universidad..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <Button className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Buscar Ruta
              </Button>
            </CardContent>
          </Card>

          {/* Available Routes */}
          {nearestStop && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  <span>Rutas Disponibles</span>
                </CardTitle>
                <CardDescription>Desde {nearestStop.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {nearestStop.routes.map((routeName) => {
                  const route = routes.find((r) => r.name === routeName)
                  return route ? (
                    <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${route.color === "blue" ? "bg-blue-500" : "bg-green-500"}`}
                        ></div>
                        <div>
                          <span className="font-medium">{route.name}</span>
                          <p className="text-sm text-muted-foreground">
                            Próximo bus en {nearestStop.estimatedTime} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">${route.fare.toLocaleString()}</span>
                        <Button size="sm" onClick={() => handleRouteSelect(route)}>
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  ) : null
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Rutas</CardTitle>
              <CardDescription>Visualiza las rutas y tu ubicación en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapsComponent userLocation={nearestStop ? { lat: nearestStop.lat, lng: nearestStop.lng } : null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pago Digital</span>
              </CardTitle>
              <CardDescription>Realiza tu pago de forma segura con Nequi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-muted p-8 rounded-lg">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Selecciona una ruta para proceder con el pago</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routes.map((route) => (
                    <Card key={route.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full ${route.color === "blue" ? "bg-blue-500" : "bg-green-500"}`}
                            ></div>
                            <span className="font-medium">{route.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${route.fare.toLocaleString()}</p>
                            <Button size="sm" onClick={() => handleRouteSelect(route)}>
                              Pagar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {showPayment && selectedRoute && (
        <PaymentModal
          route={selectedRoute}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false)
            // Aquí se podría mostrar el QR code
          }}
        />
      )}
    </div>
  )
}
