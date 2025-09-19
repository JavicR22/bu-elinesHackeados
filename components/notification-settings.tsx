"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"

interface NotificationSettingsProps {
    onToggle: (enabled: boolean) => void
    enabled: boolean
}

export function NotificationSettings({ onToggle, enabled }: NotificationSettingsProps) {
    const [permission, setPermission] = useState<NotificationPermission>("default")

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission)
        }
    }, [])

    const requestPermission = async () => {
        if ("Notification" in window) {
            const result = await Notification.requestPermission()
            setPermission(result)
            if (result === "granted") {
                onToggle(true)
            }
        }
    }

    const testNotification = () => {
        if (permission === "granted") {
            new Notification("🚌 Notificación de prueba", {
                body: "Las notificaciones están funcionando correctamente",
                icon: "/bus-icon.jpg",
            })
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                    Notificaciones de Autobús
                </CardTitle>
                <CardDescription>Recibe alertas cuando tu autobús esté a 2 minutos de llegar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {permission === "default" && (
                    <div className="text-sm text-muted-foreground">
                        <p>Para recibir notificaciones, necesitas dar permisos al navegador.</p>
                        <Button onClick={requestPermission} className="mt-2 w-full">
                            Activar Notificaciones
                        </Button>
                    </div>
                )}

                {permission === "denied" && (
                    <div className="text-sm text-destructive">
                        <p>Las notificaciones están bloqueadas. Puedes habilitarlas en la configuración del navegador.</p>
                    </div>
                )}

                {permission === "granted" && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Notificaciones activas</span>
                            <Switch checked={enabled} onCheckedChange={onToggle} />
                        </div>
                        <Button onClick={testNotification} variant="outline" size="sm" className="w-full bg-transparent">
                            Probar Notificación
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
