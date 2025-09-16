"use client"

import { useState, useEffect } from "react"

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

  const { enableHighAccuracy = true, timeout = 10000, maximumAge = 60000, watch = false } = options

  useEffect(() => {
    let watchId: number | null = null

    const updateLocation = (position: GeolocationPosition) => {
      setState((prev) => ({
        ...prev,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
        permission: "granted",
      }))
    }

    const updateError = (error: GeolocationPositionError) => {
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
    }

    const requestLocation = () => {
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocalización no soportada",
          loading: false,
          permission: "denied",
        }))
        return
      }

      const geoOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }

      if (watch) {
        watchId = navigator.geolocation.watchPosition(updateLocation, updateError, geoOptions)
      } else {
        navigator.geolocation.getCurrentPosition(updateLocation, updateError, geoOptions)
      }
    }

    requestLocation()

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch])

  const requestPermission = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocalización no soportada",
        loading: false,
        permission: "denied",
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
          permission: "granted",
        }))
      },
      (error) => {
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
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      },
    )
  }

  return {
    ...state,
    requestPermission,
  }
}
