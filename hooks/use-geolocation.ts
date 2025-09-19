"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface GeolocationState {
    location: { lat: number; lng: number } | null
    error: string | null
    loading: boolean
    permission: "granted" | "denied" | "prompt"
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    maximumAge?: number
    watch?: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const [state, setState] = useState<GeolocationState>({
        location: null,
        error: null,
        loading: true,
        permission: "prompt",
    })

    const watchIdRef = useRef<number | null>(null)
    const optionsRef = useRef(options)

    // Actualizar opciones solo si realmente cambiaron
    useEffect(() => {
        const {
            enableHighAccuracy = true,
            timeout = 10000,
            maximumAge = 60000,
            watch = false
        } = options

        // Solo actualizar si las opciones realmente cambiaron
        if (
            optionsRef.current.enableHighAccuracy !== enableHighAccuracy ||
            optionsRef.current.timeout !== timeout ||
            optionsRef.current.maximumAge !== maximumAge ||
            optionsRef.current.watch !== watch
        ) {
            optionsRef.current = options
        }
    }, [options])

    const updateLocation = useCallback((position: GeolocationPosition) => {
        const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        }

        setState((prev) => {
            // Solo actualizar si la ubicación cambió significativamente (más de ~1 metro)
            if (!prev.location ||
                Math.abs(prev.location.lat - newLocation.lat) > 0.00001 ||
                Math.abs(prev.location.lng - newLocation.lng) > 0.00001) {
                return {
                    ...prev,
                    location: newLocation,
                    error: null,
                    loading: false,
                    permission: "granted",
                }
            }

            // Si no cambió significativamente, solo actualizar loading y permission si es necesario
            if (prev.loading || prev.permission !== "granted") {
                return {
                    ...prev,
                    error: null,
                    loading: false,
                    permission: "granted",
                }
            }

            return prev
        })
    }, [])

    const updateError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = "Error desconocido"
        let permission: "granted" | "denied" | "prompt" = "prompt"

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Acceso a la ubicación denegado"
                permission = "denied"
                break
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Información de ubicación no disponible"
                break
            case error.TIMEOUT:
                errorMessage = "Tiempo de espera agotado"
                break
        }

        setState((prev) => ({
            ...prev,
            error: errorMessage,
            loading: false,
            permission,
        }))
    }, [])

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: "Geolocalización no soportada",
                loading: false,
                permission: "denied",
            }))
            return
        }

        const { enableHighAccuracy, timeout, maximumAge, watch } = optionsRef.current

        const geoOptions = {
            enableHighAccuracy: enableHighAccuracy ?? true,
            timeout: timeout ?? 10000,
            maximumAge: maximumAge ?? 60000,
        }

        // Limpiar watch anterior si existe
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }

        if (watch) {
            watchIdRef.current = navigator.geolocation.watchPosition(updateLocation, updateError, geoOptions)
        } else {
            navigator.geolocation.getCurrentPosition(updateLocation, updateError, geoOptions)
        }
    }, [updateLocation, updateError])

    useEffect(() => {
        requestLocation()

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }
        }
    }, [requestLocation])

    const requestPermission = useCallback(() => {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        requestLocation()
    }, [requestLocation])

    return {
        ...state,
        requestPermission,
    }
}