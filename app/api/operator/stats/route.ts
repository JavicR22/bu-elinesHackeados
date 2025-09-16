import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today" // today, week, month

    // Mock operator statistics
    const stats = {
      activeRoutes: 12,
      totalVehicles: 45,
      activeVehicles: 42,
      dailyRevenue: 2450000,
      weeklyRevenue: 15680000,
      monthlyRevenue: 67200000,
      activePassengers: 1250,
      totalTrips: 485,
      pendingPayments: 15,
      systemAlerts: 3,
      routePerformance: [
        {
          routeId: "1",
          routeName: "Ruta 15 - Centro",
          revenue: 450000,
          trips: 120,
          passengers: 2800,
          onTimePercentage: 95,
        },
        {
          routeId: "2",
          routeName: "Ruta 8 - Directo",
          revenue: 380000,
          trips: 95,
          passengers: 2280,
          onTimePercentage: 92,
        },
        {
          routeId: "3",
          routeName: "Ruta 22 - Expreso",
          revenue: 280000,
          trips: 70,
          passengers: 1680,
          onTimePercentage: 88,
        },
      ],
      paymentMethods: [
        { method: "nequi", count: 285, percentage: 65, amount: 712500 },
        { method: "cash", count: 120, percentage: 27, amount: 300000 },
        { method: "card", count: 35, percentage: 8, amount: 87500 },
      ],
      hourlyData: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        passengers: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      })),
    }

    return NextResponse.json({
      success: true,
      data: stats,
      period,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching operator stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch operator stats" }, { status: 500 })
  }
}
