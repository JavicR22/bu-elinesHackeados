"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface Stop {
  id: string
  name: string
  order: number
}

interface RouteFormData {
  routeName: string
  origin: string
  destination: string
  price: string
  category: string
  frequency: string
  operatingHours: string
  description: string
  stops: Stop[]
}

interface RouteFormProps {
  initialData?: Partial<RouteFormData>
  onSubmit: (data: RouteFormData) => void
  submitLabel?: string
}

export function RouteForm({ initialData, onSubmit, submitLabel = "Guardar" }: RouteFormProps) {
  const [formData, setFormData] = useState<RouteFormData>({
    routeName: initialData?.routeName || "",
    origin: initialData?.origin || "",
    destination: initialData?.destination || "",
    price: initialData?.price || "",
    category: initialData?.category || "",
    frequency: initialData?.frequency || "",
    operatingHours: initialData?.operatingHours || "",
    description: initialData?.description || "",
    stops: initialData?.stops || [],
  })

  const [newStopName, setNewStopName] = useState("")

  const addStop = () => {
    if (newStopName.trim()) {
      const newStop: Stop = {
        id: Date.now().toString(),
        name: newStopName.trim(),
        order: formData.stops.length + 1,
      }
      setFormData({
        ...formData,
        stops: [...formData.stops, newStop],
      })
      setNewStopName("")
    }
  }

  const removeStop = (id: string) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((stop) => stop.id !== id),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateField = (field: keyof RouteFormData, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="routeName">Nombre de la Ruta</Label>
          <Input
            id="routeName"
            placeholder="Ej: Ruta 25 - Centro"
            value={formData.routeName}
            onChange={(e) => updateField("routeName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={formData.category} onValueChange={(value) => updateField("category", value)} required>
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
            value={formData.origin}
            onChange={(e) => updateField("origin", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destino</Label>
          <Input
            id="destination"
            placeholder="Punto de llegada"
            value={formData.destination}
            onChange={(e) => updateField("destination", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Tarifa (COP)</Label>
          <Input
            id="price"
            type="number"
            placeholder="2500"
            value={formData.price}
            onChange={(e) => updateField("price", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Frecuencia</Label>
          <Select value={formData.frequency} onValueChange={(value) => updateField("frequency", value)} required>
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
            value={formData.operatingHours}
            onChange={(e) => updateField("operatingHours", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Descripción adicional de la ruta..."
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <Label>Paradas de la Ruta</Label>
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

        {formData.stops.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {formData.stops.map((stop, index) => (
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
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
