"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Smartphone, QrCode, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PaymentData {
  routeId: string
  routeName: string
  origin: string
  destination: string
  price: number
  estimatedTime: string
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const routeId = searchParams.get("route")

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [paymentStep, setPaymentStep] = useState<"select" | "nequi" | "processing" | "success" | "error">("select")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [transactionId, setTransactionId] = useState("")

  useEffect(() => {
    // Simulate fetching route data
    if (routeId) {
      const mockRouteData: PaymentData = {
        routeId: routeId,
        routeName: "Ruta 15 - Centro",
        origin: "Macarena",
        destination: "Terminal",
        price: 2500,
        estimatedTime: "25 min",
      }
      setPaymentData(mockRouteData)
    }
  }, [routeId])

  const handleNequiPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      return
    }

    setPaymentStep("processing")

    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1 // 90% success rate
      if (success) {
        const txId = `TXN${Date.now()}`
        setTransactionId(txId)
        // Generate QR code (in real app, this would come from backend)
        setQrCode(`QR-${txId}-${paymentData?.routeId}`)
        setPaymentStep("success")
      } else {
        setPaymentStep("error")
      }
    }, 3000)
  }

  const resetPayment = () => {
    setPaymentStep("select")
    setPhoneNumber("")
    setQrCode("")
    setTransactionId("")
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ruta no encontrada</h3>
            <p className="text-muted-foreground mb-4">No se pudo cargar la información de la ruta</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/route-search">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6" />
              <h1 className="text-xl font-bold">Pago Digital</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Route Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen del Viaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Ruta:</span>
                <span>{paymentData.routeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Origen:</span>
                <span>{paymentData.origin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Destino:</span>
                <span>{paymentData.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tiempo estimado:</span>
                <span>{paymentData.estimatedTime}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total a pagar:</span>
                <span className="text-primary">${paymentData.price.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        {paymentStep === "select" && (
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
              <CardDescription>Selecciona cómo quieres pagar tu viaje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setPaymentStep("nequi")}
                className="w-full h-16 text-left justify-start"
                variant="outline"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Nequi</p>
                    <p className="text-sm text-muted-foreground">Pago rápido y seguro</p>
                  </div>
                  <Badge className="ml-auto">Recomendado</Badge>
                </div>
              </Button>

              <Button className="w-full h-16 text-left justify-start bg-transparent" variant="outline" disabled>
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Tarjeta de Crédito</p>
                    <p className="text-sm text-muted-foreground">Próximamente disponible</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Nequi Payment Form */}
        {paymentStep === "nequi" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-600" />
                Pago con Nequi
              </CardTitle>
              <CardDescription>Ingresa tu número de celular registrado en Nequi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de celular</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3001234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">Debe ser el mismo número registrado en tu cuenta Nequi</p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Detalles del pago:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${paymentData.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión Nequi:</span>
                    <span>$0</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${paymentData.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPaymentStep("select")} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleNequiPayment}
                  disabled={phoneNumber.length < 10}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Pagar con Nequi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Payment */}
        {paymentStep === "processing" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Procesando pago...</h3>
              <p className="text-muted-foreground mb-4">
                Estamos procesando tu pago con Nequi. Por favor espera un momento.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Esto puede tomar hasta 30 segundos</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Success */}
        {paymentStep === "success" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h3>
                <p className="text-muted-foreground mb-4">Tu pago ha sido procesado correctamente</p>
                <Badge variant="secondary" className="text-sm">
                  ID: {transactionId}
                </Badge>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Tu Código QR
                </CardTitle>
                <CardDescription>Muestra este código al conductor para abordar</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-muted-foreground/20 inline-block">
                  <div className="w-48 h-48 bg-black text-white flex items-center justify-center text-xs font-mono break-all p-4">
                    {qrCode}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Código: {qrCode}</p>
                  <p className="text-sm text-muted-foreground">
                    Este código es válido por 2 horas desde el momento del pago
                  </p>
                </div>
                <Button className="w-full">Descargar QR</Button>
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Viaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ruta:</span>
                    <span>{paymentData.routeName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Origen:</span>
                    <span>{paymentData.origin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Destino:</span>
                    <span>{paymentData.destination}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Método de pago:</span>
                    <span>Nequi - {phoneNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Fecha:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total pagado:</span>
                    <span className="text-green-600">${paymentData.price.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Volver al inicio
                </Button>
              </Link>
              <Link href="/real-time" className="flex-1">
                <Button className="w-full">Ver buses en tiempo real</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Payment Error */}
        {paymentStep === "error" && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-600 mb-2">Error en el Pago</h3>
              <p className="text-muted-foreground mb-6">
                No pudimos procesar tu pago. Por favor verifica tu información e intenta nuevamente.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-muted-foreground">Posibles causas:</p>
                <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto">
                  <li>• Saldo insuficiente en Nequi</li>
                  <li>• Número de celular incorrecto</li>
                  <li>• Problemas de conectividad</li>
                  <li>• Cuenta Nequi bloqueada</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetPayment} className="flex-1 bg-transparent">
                  Intentar de nuevo
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
