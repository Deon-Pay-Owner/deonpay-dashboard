/**
 * DeonPay API Client
 * Helper functions to call the API worker (api.deonpay.mx)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_DEONPAY_API_URL || 'https://api.deonpay.mx/v1'

/**
 * Get the merchant's public API key from localStorage
 * This key is used to authenticate requests to the API worker
 */
function getPublicApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('deonpay_public_key')
}

/**
 * Set the merchant's public API key in localStorage
 */
export function setPublicApiKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('deonpay_public_key', key)
}

/**
 * Make an authenticated request to the DeonPay API
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: any }> {
  const apiKey = getPublicApiKey()

  if (!apiKey) {
    return {
      error: {
        message: 'API key not found. Please configure your API keys in the Developers section.',
        code: 'missing_api_key'
      }
    }
  }

  const url = `${API_BASE_URL}${endpoint}`

  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${apiKey}`)
  headers.set('Content-Type', 'application/json')

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        error: data.error || {
          message: `API request failed: ${response.statusText}`,
          code: 'api_error',
          status: response.status
        }
      }
    }

    return { data }
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Network error',
        code: 'network_error'
      }
    }
  }
}

/**
 * Product API methods
 */
export const products = {
  list: async (params?: { limit?: number; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())

    const query = searchParams.toString()
    return apiRequest(`/products${query ? `?${query}` : ''}`)
  },

  create: async (data: {
    name: string
    description?: string
    unit_amount: number
    currency: string
    type: 'one_time' | 'recurring'
    recurring_interval?: string
    recurring_interval_count?: number
    active?: boolean
    images?: string[]
  }) => {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  get: async (productId: string) => {
    return apiRequest(`/products/${productId}`)
  },

  update: async (productId: string, data: Partial<{
    name: string
    description: string
    unit_amount: number
    active: boolean
    images: string[]
  }>) => {
    return apiRequest(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: async (productId: string) => {
    return apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    })
  }
}

/**
 * Customer API methods
 */
export const customers = {
  list: async (params?: { limit?: number; email?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.email) searchParams.append('email', params.email)

    const query = searchParams.toString()
    return apiRequest(`/customers${query ? `?${query}` : ''}`)
  },

  create: async (data: {
    email: string
    name?: string
    phone?: string
    metadata?: Record<string, any>
  }) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  get: async (customerId: string) => {
    return apiRequest(`/customers/${customerId}`)
  },

  update: async (customerId: string, data: Partial<{
    email: string
    name: string
    phone: string
    metadata: Record<string, any>
  }>) => {
    return apiRequest(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: async (customerId: string) => {
    return apiRequest(`/customers/${customerId}`, {
      method: 'DELETE'
    })
  }
}

/**
 * Payment Link API methods
 */
export const paymentLinks = {
  list: async (params?: { limit?: number; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())

    const query = searchParams.toString()
    return apiRequest(`/payment_links${query ? `?${query}` : ''}`)
  },

  create: async (data: {
    product_id: string
    active?: boolean
    metadata?: Record<string, any>
  }) => {
    return apiRequest('/payment_links', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  get: async (linkId: string) => {
    return apiRequest(`/payment_links/${linkId}`)
  },

  update: async (linkId: string, data: Partial<{
    active: boolean
    metadata: Record<string, any>
  }>) => {
    return apiRequest(`/payment_links/${linkId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  delete: async (linkId: string) => {
    return apiRequest(`/payment_links/${linkId}`, {
      method: 'DELETE'
    })
  }
}
