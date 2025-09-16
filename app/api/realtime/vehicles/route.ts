import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock real-time vehicle data with slight variations to simulate movement
    const baseTime = Date.now()
    const vehicles = [
      {
        id: "BUS001",
        routeName: "Ruta 15 - Centro",
        lat: 4.1435 + (Math.random() - 0.5) * 0.001,
        lng: -73.6255 + (Math.random() - 0.5) * 0.001,
        heading: 45 + (Math.random() - 0.5) * 10,
        speed: Math.floor(Math.random() * 40) + 10,
        occupancy: Math.floor(Math.random() * 15) + 25,
        maxCapacity: 40,
        status: "active",
        currentStop: "Universidad Cooperativa",
        nextStop: "Centro Comercial Unicentro",
        estimatedArrival: `${Math.floor(Math.random() * 5) + 2} min`,
        lastUpdate: new Date(baseTime - Math.random() * 60000).toISOString(),
      },
      {
        id: "BUS002",
        routeName: "Ruta 8 - Directo",
        lat: 4.1398 + (Math.random() - 0.5) * 0.001,
        lng: -73.6289 + (Math.random() - 0.5) * 0.001,
        heading: 180 + (Math.random() - 0.5) * 10,
        speed: Math.floor(Math.random() * 30),
        occupancy: Math.floor(Math.random() * 10) + 30,
        maxCapacity: 40,
        status: Math.random() > 0.8 ? "delayed" : "active",
        currentStop: "Terminal de Transporte",
        nextStop: "Estadio Bello Horizonte",
        estimatedArrival: `${Math.floor(Math.random() * 8) + 3} min`,
        lastUpdate: new Date(baseTime - Math.random() * 60000).toISOString(),
      },
      {
        id: "BUS003",
        routeName: "Ruta 22 - Expreso",
        lat: 4.1456 + (Math.random() - 0.5) * 0.001,
        lng: -73.6234 + (Math.random() - 0.5) * 0.001,
        heading: 270 + (Math.random() - 0.5) * 10,
        speed: Math.floor(Math.random() * 35) + 15,
        occupancy: Math.floor(Math.random() * 20) + 10,
        maxCapacity: 45,
        status: "active",
        currentStop: "Centro",
        nextStop: "Macarena",
        estimatedArrival: `${Math.floor(Math.random() * 4) + 1} min`,
        lastUpdate: new Date(baseTime - Math.random() * 60000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: vehicles,
      timestamp: new Date().toISOString(),
      total: vehicles.length,
    })
  } catch (error) {
    console.error("Error fetching real-time vehicles:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch real-time vehicles" }, { status: 500 })
  }
}
