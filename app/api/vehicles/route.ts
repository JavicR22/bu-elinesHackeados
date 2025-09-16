import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const routeId = searchParams.get("routeId")
    const status = searchParams.get("status")

    // Mock vehicles data
    const vehicles = [
      {
        id: "BUS001",
        plate: "ABC-123",
        routeId: "1",
        routeName: "Ruta 15 - Centro",
        driver: "Pedro Martínez",
        status: "active",
        location: {
          lat: 4.1435,
          lng: -73.6255,
          address: "Universidad Cooperativa",
        },
        nextStop: "Centro Comercial Unicentro",
        estimatedArrival: "3 min",
        speed: 25,
        heading: 45,
        fuel: 85,
        occupancy: 28,
        maxCapacity: 40,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "BUS002",
        plate: "DEF-456",
        routeId: "2",
        routeName: "Ruta 8 - Directo",
        driver: "Ana Rodríguez",
        status: "active",
        location: {
          lat: 4.1398,
          lng: -73.6289,
          address: "Terminal de Transporte",
        },
        nextStop: "Estadio Bello Horizonte",
        estimatedArrival: "7 min",
        speed: 0,
        heading: 180,
        fuel: 62,
        occupancy: 35,
        maxCapacity: 40,
        lastUpdate: new Date().toISOString(),
      },
      {
        id: "BUS003",
        plate: "GHI-789",
        routeId: "3",
        routeName: "Ruta 22 - Expreso",
        driver: "Luis González",
        status: "maintenance",
        location: {
          lat: 4.1456,
          lng: -73.6234,
          address: "Taller Central",
        },
        nextStop: null,
        estimatedArrival: null,
        speed: 0,
        heading: 0,
        fuel: 0,
        occupancy: 0,
        maxCapacity: 45,
        lastUpdate: new Date().toISOString(),
      },
    ]

    let filteredVehicles = vehicles

    // Filter by route
    if (routeId) {
      filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.routeId === routeId)
    }

    // Filter by status
    if (status) {
      filteredVehicles = filteredVehicles.filter((vehicle) => vehicle.status === status)
    }

    return NextResponse.json({
      success: true,
      data: filteredVehicles,
      total: filteredVehicles.length,
    })
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vehicles" }, { status: 500 })
  }
}
