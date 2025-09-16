"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Smartphone, CreditCard, CheckCircle, QrCode, X, ArrowLeft } from "lucide-react"
import QRCodeGenerator from "@/components/qr-code-generator"

interface Route {
  id: string
  name: string
  fare: number
  color: string
}

interface PaymentModalProps {
  route: Route
  onClose: () => void
  onSuccess: () => void
}

type PaymentStep = "method" | "nequi" | "processing" | "success" | "qr"

export default function PaymentModal({ route, onClose, onSuccess }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [qrData, setQrData] = useState("")

  const handleNequiPayment = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Por favor ingresa un número de teléfono válido")
      return
    }
    setCurrentStep("processing")

    // Simular procesamiento de pago
    setTimeout(() => {
      const newTransactionId = `TXN${Date.now()}`
      setTransactionId(newTransactionId)

      // Generar datos para el QR
      const qrPaymentData = {
        transactionId: newTransactionId,
        route: route.name,
        amount: route.fare,
        timestamp: new Date().toISOString(),
        phone: phoneNumber,
      }
      setQrData(JSON.stringify(qrPaymentData))
      setCurrentStep("success")
    }, 3000)
  }

  const handleShowQR = () => {
    setCurrentStep("qr")
  }

  const handleClose = () => {
    onSuccess()
    onClose()
  }

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Selecciona método de pago</h3>
        <p className="text-muted-foreground">Ruta: {route.name}</p>
        <p className="text-2xl font-bold text-primary">${route.fare.toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => setCurrentStep("nequi")}
          className="w-full h-16 flex items-center justify-between p-4"
          variant="outline"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Nequi</p>
              <p className="text-sm text-muted-foreground">Pago móvil</p>
            </div>
          </div>
          <Badge variant="secondary">Disponible</Badge>
        </Button>

        <Button disabled className="w-full h-16 flex items-center justify-between p-4 bg-transparent" variant="outline">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-400">Tarjeta</p>
              <p className="text-sm text-muted-foreground">Próximamente</p>
            </div>
          </div>
          <Badge variant="secondary">Próximamente</Badge>
        </Button>
      </div>
    </div>
  )

  const renderNequiPayment = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep("method")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="bg-purple-100 p-2 rounded-lg">
          <Smartphone className="h-5 w-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold">Pago con Nequi</h3>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-bold text-primary">${route.fare.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="3001234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN Nequi (simulado)</Label>
              <Input
                id="pin"
                type="password"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>

          <Button onClick={handleNequiPayment} className="w-full">
            Pagar ${route.fare.toLocaleString()}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderProcessing = () => (
    <div className="text-center space-y-4">
      <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
        <Smartphone className="h-8 w-8 text-purple-600 animate-pulse" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Procesando pago...</h3>
        <p className="text-muted-foreground">Conectando con Nequi</p>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-green-600">¡Pago exitoso!</h3>
        <p className="text-muted-foreground">Tu pago ha sido procesado correctamente</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ruta:</span>
            <span className="font-medium">{route.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto:</span>
            <span className="font-medium">${route.fare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transacción:</span>
            <span className="font-mono text-sm">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono:</span>
            <span className="font-medium">{phoneNumber}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Button onClick={handleShowQR} className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Generar Código QR
        </Button>
        <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
          Finalizar
        </Button>
      </div>
    </div>
  )

  const renderQRCode = () => (
    <div className="text-center space-y-4">
      <div className="flex items-center space-x-2 justify-center">
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep("success")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <QrCode className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Código QR de Pago</h3>
      </div>

      <div className="bg-white p-6 rounded-lg border-2 border-dashed border-primary">
        <QRCodeGenerator data={qrData} size={200} />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Muestra este código QR al conductor para validar tu pago</p>
        <Badge variant="secondary" className="text-xs">
          ID: {transactionId}
        </Badge>
      </div>

      <Button onClick={handleClose} className="w-full">
        Finalizar
      </Button>
    </div>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Pago Digital</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>Sistema de pago seguro para transporte público</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentStep === "method" && renderMethodSelection()}
          {currentStep === "nequi" && renderNequiPayment()}
          {currentStep === "processing" && renderProcessing()}
          {currentStep === "success" && renderSuccess()}
          {currentStep === "qr" && renderQRCode()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
