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

        // Fetch the public API key from Supabase
        const response = await fetch(`/api/merchant/${merchantId}/api-keys`)

        if (!response.ok) {
          console.error('Failed to load API keys')
          return
        }

        const { keys } = await response.json()

        // Find the first active public key
        const publicKey = keys?.find(
          (key: any) => key.type === 'public' && key.is_active
        )

        if (publicKey) {
          setPublicApiKey(publicKey.key)
        }
      } catch (error) {
        console.error('Error loading API key:', error)
      }
    }

    loadApiKey()
  }, [merchantId])

  return null // This component doesn't render anything
}
