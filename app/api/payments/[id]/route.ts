import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock payment data
    const payment = {
      id,
      routeId: "1",
      routeName: "Ruta 15 - Centro",
      origin: "Macarena",
      destination: "Terminal",
      amount: 2500,
      method: "nequi",
      phoneNumber: "3001234567",
      status: "completed",
      qrCode: `QR-${id}-ROUTE1`,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      details: {
        processingTime: "2.3s",
        commission: 0,
        reference: `REF-${id}`,
      },
    }

    return NextResponse.json({
      success: true,
      data: payment,
    })
  } catch (error) {
    console.error("Error fetching payment:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch payment" }, { status: 500 })
  }
}
