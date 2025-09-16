"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bus, MapPin, Settings } from "lucide-react"
import OperatorPanel from "@/components/operator-panel"
import PassengerPanel from "@/components/passenger-panel"

export default function HomePage() {
  const [activePanel, setActivePanel] = useState<"passenger" | "operator">("passenger")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Bus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Movilidad Inteligente</h1>
                <p className="text-sm text-muted-foreground">Villavicencio</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={activePanel === "passenger" ? "default" : "outline"}
                onClick={() => setActivePanel("passenger")}
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Pasajero</span>
              </Button>
              <Button
                variant={activePanel === "operator" ? "default" : "outline"}
                onClick={() => setActivePanel("operator")}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Operador</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activePanel === "passenger" ? <PassengerPanel /> : <OperatorPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Movilidad Inteligente Villavicencio. Sistema de transporte público moderno.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
