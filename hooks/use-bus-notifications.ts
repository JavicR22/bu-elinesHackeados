"use client"

import { useEffect, useRef } from "react"
import { useNotifications } from "./use-notifications"

interface BusStop {
    lat: number
    lng: number
    name: string
}

interface Bus {
    id: string
    routeName: string
    currentSegment: number
    progress: number
    isWaiting: boolean
    segments: Array<{
        origin: { lat: number; lng: number }
        destination: { lat: number; lng: number }
        duration: number
        distance: number
    }>
}

interface UseBusNotificationsProps {
    userStop: BusStop | null
    buses: Bus[]
    routeName: string
    enabled: boolean
}

const STOP_WAIT_TIME = 30000 // 30 segundos en milisegundos
const NOTIFICATION_THRESHOLD = 2 // 2 minutos

export function useBusNotifications({ userStop, buses, routeName, enabled }: UseBusNotificationsProps) {
    const { sendNotification } = useNotifications()
    const notifiedBuses = useRef(new Set<string>())
    const lastCheckTime = useRef(Date.now())

    const calculateEstimatedTimeForStop = (
        targetStop: BusStop,
        targetRouteName: string,
        busList: Bus[],
    ): { minTime: number; busId: string | null } => {
        let minTime = Number.POSITIVE_INFINITY
        let closestBusId: string | null = null

        busList.forEach((bus) => {
            if (bus.routeName !== targetRouteName) return

            const segments = bus.segments
            let totalTime = 0
            let foundTarget = false

            for (let segIndex = bus.currentSegment; segIndex < bus.currentSegment + segments.length; segIndex++) {
                const currentSegIndex = segIndex % segments.length
                const segment = segments[currentSegIndex]

                const isDestination =
                    Math.abs(segment.destination.lat - targetStop.lat) < 0.001 &&
                    Math.abs(segment.destination.lng - targetStop.lng) < 0.001
                const isOrigin =
                    Math.abs(segment.origin.lat - targetStop.lat) < 0.001 && Math.abs(segment.origin.lng - targetStop.lng) < 0.001

                if (segIndex === bus.currentSegment) {
                    if (isOrigin) {
                        if (totalTime < minTime) {
                            minTime = totalTime
                            closestBusId = bus.id
                        }
                        foundTarget = true
                        break
                    }
                    const remainingRatio = 1 - bus.progress
                    const remainingTime = (segment.duration * remainingRatio) / 60
                    totalTime += remainingTime
                    if (bus.isWaiting) totalTime += STOP_WAIT_TIME / 60000

                    if (isDestination) {
                        if (totalTime < minTime) {
                            minTime = totalTime
                            closestBusId = bus.id
                        }
                        foundTarget = true
                        break
                    }
                } else {
                    const segmentTime = segment.duration > 0 ? segment.duration / 60 : (segment.distance / 1000 / 20) * 60
                    totalTime += segmentTime + STOP_WAIT_TIME / 60000

                    if (isDestination) {
                        if (totalTime < minTime) {
                            minTime = totalTime
                            closestBusId = bus.id
                        }
                        foundTarget = true
                        break
                    }
                }
            }
        })

        return {
            minTime: minTime === Number.POSITIVE_INFINITY ? 5 : Math.ceil(minTime),
            busId: closestBusId,
        }
    }

    useEffect(() => {
        if (!enabled || !userStop || buses.length === 0) return

        const now = Date.now()
        // Solo verificar cada 30 segundos para evitar spam
        if (now - lastCheckTime.current < 30000) return

        lastCheckTime.current = now

        const { minTime, busId } = calculateEstimatedTimeForStop(userStop, routeName, buses)

        // Si el autobús está a 2 minutos o menos y no hemos notificado sobre este autobús
        if (minTime <= NOTIFICATION_THRESHOLD && busId && !notifiedBuses.current.has(busId)) {
            sendNotification({
                title: "🚌 ¡Tu autobús está llegando!",
                body: `El autobús de la ruta ${routeName} llegará a ${userStop.name} en aproximadamente ${minTime} minuto${minTime !== 1 ? "s" : ""}`,
                tag: `bus-${busId}-${userStop.name}`,
            })

            // Marcar este autobús como notificado
            notifiedBuses.current.add(busId)

            // Limpiar la notificación después de 5 minutos
            setTimeout(
                () => {
                    notifiedBuses.current.delete(busId)
                },
                5 * 60 * 1000,
            )
        }
    }, [buses, userStop, routeName, enabled, sendNotification])

    // Limpiar notificaciones cuando cambie la parada del usuario
    useEffect(() => {
        notifiedBuses.current.clear()
    }, [userStop?.name])

    return {
        calculateEstimatedTimeForStop: (targetStop: BusStop) => calculateEstimatedTimeForStop(targetStop, routeName, buses),
    }
}
