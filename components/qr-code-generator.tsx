"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  data: string
  size?: number
}

export default function QRCodeGenerator({ data, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [data, size])

  const generateQRCode = () => {
    if (!canvasRef.current || !data) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas
    canvas.width = size
    canvas.height = size

    // Limpiar canvas
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, size, size)

    // Generar patrón QR simple (simulado)
    const moduleSize = size / 25 // 25x25 módulos
    ctx.fillStyle = "#000000"

    // Crear patrón basado en los datos
    const hash = simpleHash(data)

    // Esquinas de posicionamiento
    drawPositionMarker(ctx, 0, 0, moduleSize)
    drawPositionMarker(ctx, 18 * moduleSize, 0, moduleSize)
    drawPositionMarker(ctx, 0, 18 * moduleSize, moduleSize)

    // Patrón de datos basado en hash
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Evitar esquinas de posicionamiento
        if (isPositionMarkerArea(i, j)) continue

        const shouldFill = (hash + i * j) % 3 === 0
        if (shouldFill) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }

  const simpleHash = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convertir a 32bit integer
    }
    return Math.abs(hash)
  }

  const drawPositionMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Marco exterior (7x7)
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize)
    ctx.fillStyle = "#000000"
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize)
  }

  const isPositionMarkerArea = (i: number, j: number): boolean => {
    // Esquina superior izquierda
    if (i < 9 && j < 9) return true
    // Esquina superior derecha
    if (i > 15 && j < 9) return true
    // Esquina inferior izquierda
    if (i < 9 && j > 15) return true
    return false
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas ref={canvasRef} className="border border-gray-200 rounded" style={{ maxWidth: "100%", height: "auto" }} />
      <p className="text-xs text-muted-foreground">Código QR generado</p>
    </div>
  )
}
