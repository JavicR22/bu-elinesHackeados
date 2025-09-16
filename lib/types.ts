export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  price: number
  estimatedTime: number
  status: "active" | "delayed" | "inactive"
  stops: Stop[]
  schedule: Schedule[]
}

export interface Stop {
  id: string
  name: string
  latitude: number
  longitude: number
  order: number
}

export interface Schedule {
  id: string
  departureTime: string
  arrivalTime: string
  frequency: number // minutes
}

export interface Payment {
  id: string
  userId: string
  routeId: string
  amount: number
  method: "nequi" | "cash" | "card"
  status: "pending" | "completed" | "failed"
  qrCode?: string
  createdAt: Date
}

export interface Vehicle {
  id: string
  routeId: string
  latitude: number
  longitude: number
  speed: number
  capacity: number
  occupancy: number
  lastUpdate: Date
}
