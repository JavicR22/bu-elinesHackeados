"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Clock, CheckCircle, XCircle, Eye } from "lucide-react"

interface PaymentRecord {
  id: string
  routeName: string
  origin: string
  destination: string
  amount: number
  method: string
  status: "completed" | "pending" | "failed"
  date: Date
  qrCode?: string
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching payment history
    setTimeout(() => {
      const mockPayments: PaymentRecord[] = [
        {
          id: "TXN001",
          routeName: "Ruta 15 - Centro",
          origin: "Macarena",
          destination: "Terminal",
          amount: 2500,
          method: "Nequi",
          status: "completed",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          qrCode: "QR-TXN001-ROUTE15",
        },
        {
          id: "TXN002",
          routeName: "Ruta 8 - Directo",
          origin: "Barzal",
          destination: "Centro Comercial",
          amount: 2500,
          method: "Nequi",
          status: "completed",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: "TXN003",
          routeName: "Ruta 22 - Expreso",
          origin: "Norte",
          destination: "Terminal Sur",
          amount: 3000,
          method: "Nequi",
          status: "failed",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      ]
      setPayments(mockPayments)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "pending":
        return "Pendiente"
      case "failed":
        return "Fallido"
      default:
        return "Desconocido"
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Hace menos de 1 hora"
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `Hace ${diffInDays} días`
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Historial de Pagos
        </CardTitle>
        <CardDescription>Tus últimas transacciones de transporte</CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.routeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.origin} → {payment.destination}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${payment.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </div>
                  {payment.qrCode && payment.status === "completed" && (
                    <Button variant="ghost" size="sm" className="mt-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver QR
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
