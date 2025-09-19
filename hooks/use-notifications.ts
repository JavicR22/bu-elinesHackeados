"use client"

import { useEffect, useRef } from "react"

interface NotificationOptions {
    title: string
    body: string
    icon?: string
    tag?: string
}

export function useNotifications() {
    const permissionGranted = useRef(false)

    useEffect(() => {
        // Solicitar permisos de notificación al cargar
        if ("Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then((permission) => {
                    permissionGranted.current = permission === "granted"
                })
            } else {
                permissionGranted.current = Notification.permission === "granted"
            }
        }
    }, [])

    const sendNotification = (options: NotificationOptions) => {
        if (!permissionGranted.current || !("Notification" in window)) {
            console.log("Notificaciones no disponibles o no permitidas")
            return
        }

        try {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || "/bus-icon.jpg",
                tag: options.tag || "bus-notification",
                requireInteraction: true,
            })

            // Auto cerrar después de 10 segundos
            setTimeout(() => {
                notification.close()
            }, 10000)

            return notification
        } catch (error) {
            console.error("Error enviando notificación:", error)
        }
    }

    return { sendNotification, permissionGranted: permissionGranted.current }
}
