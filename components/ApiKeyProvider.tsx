'use client'

import { useEffect } from 'react'
import { setPublicApiKey } from '@/lib/api-client'

interface ApiKeyProviderProps {
  merchantId: string
}

/**
 * Component that loads the merchant's public API key into localStorage
 * This should be mounted at the dashboard root to ensure all pages have access to the API key
 */
export default function ApiKeyProvider({ merchantId }: ApiKeyProviderProps) {
  useEffect(() => {
    async function loadApiKey() {
      try {
        // Check if key is already in localStorage
        const existingKey = localStorage.getItem('deonpay_public_key')
        if (existingKey) {
          return // Key already loaded
        }

        // Fetch the public API key from the existing endpoint
        const response = await fetch(`/api/merchant/${merchantId}/api-key`)

        if (!response.ok) {
          console.error('Failed to load API key')
          return
        }

        const { api_key } = await response.json()

        if (api_key) {
          setPublicApiKey(api_key)
        }
      } catch (error) {
        console.error('Error loading API key:', error)
      }
    }

    loadApiKey()
  }, [merchantId])

  return null // This component doesn't render anything
}
