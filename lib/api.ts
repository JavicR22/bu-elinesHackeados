// API utility functions for the frontend

const API_BASE_URL = process.env.NODE_ENV === "production" ? "" : ""

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Routes API
  async getRoutes(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.search) searchParams.append("search", params.search)

    const query = searchParams.toString()
    return this.request(`/routes${query ? `?${query}` : ""}`)
  }

  async getRoute(id: string) {
    return this.request(`/routes/${id}`)
  }

  async createRoute(routeData: any) {
    return this.request("/routes", {
      method: "POST",
      body: JSON.stringify(routeData),
    })
  }

  async updateRoute(id: string, routeData: any) {
    return this.request(`/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(routeData),
    })
  }

  async deleteRoute(id: string) {
    return this.request(`/routes/${id}`, {
      method: "DELETE",
    })
  }

  // Vehicles API
  async getVehicles(params?: { routeId?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.routeId) searchParams.append("routeId", params.routeId)
    if (params?.status) searchParams.append("status", params.status)

    const query = searchParams.toString()
    return this.request(`/vehicles${query ? `?${query}` : ""}`)
  }

  async getVehicle(id: string) {
    return this.request(`/vehicles/${id}`)
  }

  async updateVehicle(id: string, vehicleData: any) {
    return this.request(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehicleData),
    })
  }

  // Payments API
  async processPayment(paymentData: any) {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async getPayments(params?: { userId?: string; status?: string; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.userId) searchParams.append("userId", params.userId)
    if (params?.status) searchParams.append("status", params.status)
    if (params?.limit) searchParams.append("limit", params.limit.toString())

    const query = searchParams.toString()
    return this.request(`/payments${query ? `?${query}` : ""}`)
  }

  async getPayment(id: string) {
    return this.request(`/payments/${id}`)
  }

  // Search API
  async searchRoutes(searchData: { origin: string; destination: string; departureTime?: string }) {
    return this.request("/search", {
      method: "POST",
      body: JSON.stringify(searchData),
    })
  }

  // Operator API
  async getOperatorStats(period?: string) {
    const query = period ? `?period=${period}` : ""
    return this.request(`/operator/stats${query}`)
  }

  // Real-time API
  async getRealTimeVehicles() {
    return this.request("/realtime/vehicles")
  }
}

export const apiClient = new ApiClient()

// Hook for using API with React
export function useApi() {
  return apiClient
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
