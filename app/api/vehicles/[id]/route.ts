import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock vehicle data
    const vehicle = {
      id,
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
      history: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          location: { lat: 4.142, lng: -73.627, address: "Terminal" },
          speed: 30,
          occupancy: 25,
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          location: { lat: 4.14, lng: -73.628, address: "Centro" },
          speed: 20,
          occupancy: 32,
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    })
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // In production, update vehicle data in database
    const updatedVehicle = {
      id,
      ...body,
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: updatedVehicle,
      message: "Vehicle updated successfully",
    })
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json({ success: false, error: "Failed to update vehicle" }, { status: 500 })
  }
}
