"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RoutePlanner } from "@/components/maps/route-planner"
import { LiveTracking } from "@/components/maps/live-tracking"

interface RouteMapPageProps {
  params: {
    id: string
  }
}

export default function RouteMapPage({ params }: RouteMapPageProps) {
  const [map, setMap] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const initMap = () => {
      if (!window.google) return

      const mapInstance = new window.google.maps.Map(document.getElementById("route-map"), {
        center: { lat: 4.142, lng: -73.6266 }, // Villavicencio
        zoom: 13,
      })

      setMap(mapInstance)
      setIsLoaded(true)
    }

    if (window.google) {
      initMap()
    } else {
      window.initMap = initMap
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBJid6cm7TqtvO1c0B0b9tOKfZNbA6l6Ho&callback=initMap&libraries=places`
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/maps">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Mapa
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Ruta {params.id}</h1>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-96 bg-background border-r overflow-y-auto">
          <div className="p-4 space-y-6">
            <RoutePlanner />
            <LiveTracking routeId={params.id} />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <div id="route-map" className="w-full h-full">
            {!isLoaded && (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando mapa de ruta...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
