import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { routeId, amount, method, phoneNumber, userId } = body

    // Validate required fields
    if (!routeId || !amount || !method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Simulate payment processing
    const isSuccess = Math.random() > 0.1 // 90% success rate

    if (!isSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment failed",
          details: "Insufficient funds or network error",
        },
        { status: 400 },
      )
    }

    // Generate transaction
    const transaction = {
      id: `TXN${Date.now()}`,
      routeId,
      amount: Number.parseFloat(amount),
      method,
      phoneNumber: method === "nequi" ? phoneNumber : undefined,
      userId: userId || "anonymous",
      status: "completed",
      qrCode: `QR-${Date.now()}-${routeId}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock payment history
    const payments = [
      {
        id: "TXN001",
        routeId: "1",
        routeName: "Ruta 15 - Centro",
        origin: "Macarena",
        destination: "Terminal",
        amount: 2500,
        method: "nequi",
        phoneNumber: "3001234567",
        status: "completed",
        qrCode: "QR-TXN001-ROUTE1",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      {
        id: "TXN002",
        routeId: "2",
        routeName: "Ruta 8 - Directo",
        origin: "Barzal",
        destination: "Centro Comercial",
        amount: 2500,
        method: "nequi",
        phoneNumber: "3001234567",
        status: "completed",
        qrCode: "QR-TXN002-ROUTE2",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      },
    ]

    let filteredPayments = payments

    // Filter by status
    if (status) {
      filteredPayments = filteredPayments.filter((payment) => payment.status === status)
    }

    // Limit results
    filteredPayments = filteredPayments.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: filteredPayments,
      total: filteredPayments.length,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 })
  }
}
