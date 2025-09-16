"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Share } from "lucide-react"

interface QRGeneratorProps {
  transactionId: string
  routeId: string
  amount: number
  expiresIn?: number // minutes
}

export function QRGenerator({ transactionId, routeId, amount, expiresIn = 120 }: QRGeneratorProps) {
  const [qrData, setQrData] = useState("")
  const [timeLeft, setTimeLeft] = useState(expiresIn * 60) // convert to seconds

  useEffect(() => {
    // Generate QR data (in real app, this would be more secure)
    const qrContent = {
      txId: transactionId,
      route: routeId,
      amount: amount,
      timestamp: Date.now(),
      expires: Date.now() + expiresIn * 60 * 1000,
    }
    setQrData(btoa(JSON.stringify(qrContent)))
  }, [transactionId, routeId, amount, expiresIn])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const downloadQR = () => {
    // In a real app, this would generate and download an actual QR code image
    const element = document.createElement("a")
    const file = new Blob([`QR Code: ${qrData}`], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `ticket-${transactionId}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ticket de Transporte",
          text: `Mi ticket para el transporte público - ID: ${transactionId}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrData)
      alert("Código copiado al portapapeles")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Tu Ticket Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* QR Code Display */}
        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-muted-foreground/20 inline-block">
          <div className="w-48 h-48 bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center text-xs font-mono break-all p-4 rounded-lg">
            <div className="text-center">
              <QrCode className="h-12 w-12 mx-auto mb-2" />
              <div className="text-[8px] leading-tight">{qrData.slice(0, 100)}...</div>
            </div>
          </div>
        </div>

        {/* QR Info */}
        <div className="space-y-2">
          <p className="font-medium">ID: {transactionId}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Válido por:</span>
            <span className={`text-sm font-mono ${timeLeft < 300 ? "text-red-500" : "text-green-600"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {timeLeft < 300 && <p className="text-xs text-red-500">⚠️ Tu ticket expira pronto</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={downloadQR} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
          <Button onClick={shareQR} variant="outline" className="flex-1 bg-transparent">
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg text-left">
          <h4 className="font-medium mb-2">Instrucciones:</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Muestra este código al conductor</li>
            <li>2. Espera la confirmación del escaneo</li>
            <li>3. Aborda el vehículo</li>
            <li>4. Guarda el ticket hasta completar el viaje</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
