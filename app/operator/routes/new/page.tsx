"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, MapPin, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

interface Stop {
  id: string
  name: string
  order: number
}

export default function NewRoutePage() {
  const [routeName, setRouteName] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [frequency, setFrequency] = useState("")
  const [operatingHours, setOperatingHours] = useState("")
  const [description, setDescription] = useState("")
  const [stops, setStops] = useState<Stop[]>([])
  const [newStopName, setNewStopName] = useState("")

  const addStop = () => {
    if (newStopName.trim()) {
      const newStop: Stop = {
        id: Date.now().toString(),
        name: newStopName.trim(),
        order: stops.length + 1,
      }
      setStops([...stops, newStop])
      setNewStopName("")
    }
  }

  const removeStop = (id: string) => {
    setStops(stops.filter((stop) => stop.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log({
      routeName,
      origin,
      destination,
      price: Number.parseFloat(price),
      category,
      frequency,
      operatingHours,
      description,
      stops,
    })
    // Redirect or show success message
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/operator">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              <h1 className="text-xl font-bold">Nueva Ruta</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>Configura los datos principales de la nueva ruta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="routeName">Nombre de la Ruta</Label>
                  <Input
                    id="routeName"
                    placeholder="Ej: Ruta 25 - Centro"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urbano">Urbano</SelectItem>
                      <SelectItem value="expreso">Expreso</SelectItem>
                      <SelectItem value="intermunicipal">Intermunicipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origen</Label>
                  <Input
                    id="origin"
                    placeholder="Punto de partida"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <Input
                    id="destination"
                    placeholder="Punto de llegada"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción adicional de la ruta..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tarifas y Horarios
              </CardTitle>
              <CardDescription>Configura los precios y frecuencias de operación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Tarifa (COP)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="2500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select value={frequency} onValueChange={setFrequency} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Cada..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Cada 5 minutos</SelectItem>
                      <SelectItem value="10">Cada 10 minutos</SelectItem>
                      <SelectItem value="15">Cada 15 minutos</SelectItem>
                      <SelectItem value="20">Cada 20 minutos</SelectItem>
                      <SelectItem value="30">Cada 30 minutos</SelectItem>
                      <SelectItem value="45">Cada 45 minutos</SelectItem>
                      <SelectItem value="60">Cada hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Horario de Operación</Label>
                  <Input
                    id="operatingHours"
                    placeholder="5:00 AM - 10:00 PM"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stops Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Paradas de la Ruta
              </CardTitle>
              <CardDescription>Agrega las paradas principales de la ruta en orden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la parada"
                  value={newStopName}
                  onChange={(e) => setNewStopName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStop())}
                />
                <Button type="button" onClick={addStop}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {stops.length > 0 && (
                <div className="space-y-2">
                  <Label>Paradas configuradas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {stops.map((stop, index) => (
                      <Badge key={stop.id} variant="secondary" className="flex items-center gap-2">
                        <span className="text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                          {index + 1}
                        </span>
                        {stop.name}
                        <button
                          type="button"
                          onClick={() => removeStop(stop.id)}
                          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex gap-4 justify-end">
            <Link href="/operator">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit">Crear Ruta</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
