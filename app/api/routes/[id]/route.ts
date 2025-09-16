import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock route data - in production, fetch from database
    const route = {
      id,
      name: "Ruta 15 - Centro",
      origin: "Macarena",
      destination: "Terminal",
      price: 2500,
      estimatedTime: 25,
      status: "active",
      frequency: 10,
      operatingHours: "5:00 AM - 10:00 PM",
      category: "urbano",
      description: "Ruta principal que conecta Macarena con el Terminal de Transporte",
      stops: [
        { id: "1", name: "Macarena", lat: 4.1489, lng: -73.6201, order: 1 },
        { id: "2", name: "Universidad", lat: 4.1467, lng: -73.6223, order: 2 },
        { id: "3", name: "Centro", lat: 4.1445, lng: -73.6245, order: 3 },
        { id: "4", name: "Terminal", lat: 4.1421, lng: -73.6267, order: 4 },
      ],
      schedule: [
        { departureTime: "05:00", frequency: 15 },
        { departureTime: "06:00", frequency: 10 },
        { departureTime: "18:00", frequency: 12 },
        { departureTime: "21:00", frequency: 20 },
      ],
      vehicles: ["BUS001", "BUS002", "BUS003"],
    }

    return NextResponse.json({
      success: true,
      data: route,
    })
  } catch (error) {
    console.error("Error fetching route:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch route" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    // In production, update in database
    const updatedRoute = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: updatedRoute,
      message: "Route updated successfully",
    })
  } catch (error) {
    console.error("Error updating route:", error)
    return NextResponse.json({ success: false, error: "Failed to update route" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // In production, delete from database
    return NextResponse.json({
      success: true,
      message: "Route deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting route:", error)
    return NextResponse.json({ success: false, error: "Failed to delete route" }, { status: 500 })
  }
}
