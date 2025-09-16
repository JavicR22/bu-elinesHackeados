import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Mock routes data - in production, this would come from a database
    const routes = [
      {
        id: "1",
        name: "Ruta 15 - Centro",
        origin: "Macarena",
        destination: "Terminal",
        price: 2500,
        estimatedTime: 25,
        status: "active",
        frequency: 10,
        operatingHours: "5:00 AM - 10:00 PM",
        category: "urbano",
        stops: [
          { id: "1", name: "Macarena", lat: 4.1489, lng: -73.6201, order: 1 },
          { id: "2", name: "Universidad", lat: 4.1467, lng: -73.6223, order: 2 },
          { id: "3", name: "Centro", lat: 4.1445, lng: -73.6245, order: 3 },
          { id: "4", name: "Terminal", lat: 4.1421, lng: -73.6267, order: 4 },
        ],
      },
      {
        id: "2",
        name: "Ruta 8 - Directo",
        origin: "Barzal",
        destination: "Centro Comercial",
        price: 2500,
        estimatedTime: 18,
        status: "active",
        frequency: 8,
        operatingHours: "6:00 AM - 9:00 PM",
        category: "urbano",
        stops: [
          { id: "5", name: "Barzal", lat: 4.1398, lng: -73.6289, order: 1 },
          { id: "6", name: "Estadio", lat: 4.142, lng: -73.627, order: 2 },
          { id: "7", name: "Centro Comercial", lat: 4.1445, lng: -73.6245, order: 3 },
        ],
      },
      {
        id: "3",
        name: "Ruta 22 - Expreso",
        origin: "Norte",
        destination: "Terminal Sur",
        price: 3000,
        estimatedTime: 35,
        status: "delayed",
        frequency: 15,
        operatingHours: "5:30 AM - 11:00 PM",
        category: "expreso",
        stops: [
          { id: "8", name: "Norte", lat: 4.1456, lng: -73.6234, order: 1 },
          { id: "9", name: "Centro", lat: 4.1445, lng: -73.6245, order: 2 },
          { id: "10", name: "Universidad", lat: 4.1467, lng: -73.6223, order: 3 },
          { id: "11", name: "Terminal Sur", lat: 4.14, lng: -73.628, order: 4 },
        ],
      },
    ]

    let filteredRoutes = routes

    // Filter by category
    if (category && category !== "all") {
      filteredRoutes = filteredRoutes.filter((route) => route.category === category)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRoutes = filteredRoutes.filter(
        (route) =>
          route.name.toLowerCase().includes(searchLower) ||
          route.origin.toLowerCase().includes(searchLower) ||
          route.destination.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredRoutes,
      total: filteredRoutes.length,
    })
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, origin, destination, price, category, frequency, operatingHours, stops } = body

    // Validate required fields
    if (!name || !origin || !destination || !price || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In production, save to database
    const newRoute = {
      id: Date.now().toString(),
      name,
      origin,
      destination,
      price: Number.parseFloat(price),
      category,
      frequency: Number.parseInt(frequency) || 10,
      operatingHours: operatingHours || "6:00 AM - 10:00 PM",
      status: "active",
      estimatedTime: 20, // Calculate based on distance
      stops: stops || [],
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newRoute,
      message: "Route created successfully",
    })
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json({ success: false, error: "Failed to create route" }, { status: 500 })
  }
}
