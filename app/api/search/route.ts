import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination, departureTime } = body

    if (!origin || !destination) {
      return NextResponse.json({ success: false, error: "Origin and destination are required" }, { status: 400 })
    }

    // Mock route search results
    const searchResults = [
      {
        id: "result1",
        routeName: "Ruta 15 - Centro",
        origin: "Estación Macarena",
        destination: "Terminal de Transporte",
        estimatedTime: "25 min",
        price: 2500,
        status: "active",
        nextArrival: "3 min",
        stops: ["Macarena", "Universidad", "Centro", "Terminal"],
        walkingTime: "5 min",
        nearestStop: "Estación Macarena",
        distance: "8.5 km",
        transfers: 0,
        route: {
          coordinates: [
            { lat: 4.1489, lng: -73.6201 },
            { lat: 4.1467, lng: -73.6223 },
            { lat: 4.1445, lng: -73.6245 },
            { lat: 4.1421, lng: -73.6267 },
          ],
        },
      },
      {
        id: "result2",
        routeName: "Ruta 8 - Directo",
        origin: "Estación Barzal",
        destination: "Centro Comercial",
        estimatedTime: "18 min",
        price: 2500,
        status: "active",
        nextArrival: "7 min",
        stops: ["Barzal", "Estadio", "Centro Comercial"],
        walkingTime: "8 min",
        nearestStop: "Estación Barzal",
        distance: "6.2 km",
        transfers: 0,
        route: {
          coordinates: [
            { lat: 4.1398, lng: -73.6289 },
            { lat: 4.142, lng: -73.627 },
            { lat: 4.1445, lng: -73.6245 },
          ],
        },
      },
    ]

    return NextResponse.json({
      success: true,
      data: searchResults,
      query: { origin, destination, departureTime },
      total: searchResults.length,
    })
  } catch (error) {
    console.error("Error searching routes:", error)
    return NextResponse.json({ success: false, error: "Failed to search routes" }, { status: 500 })
  }
}
