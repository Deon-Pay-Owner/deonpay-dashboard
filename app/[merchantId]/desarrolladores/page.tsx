import { createClient } from '@/lib/supabase'
import DesarrolladoresClient from './DesarrolladoresClient'
import { redirect } from 'next/navigation'

export default async function DesarrolladoresPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Check if user has access to this merchant
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch API keys for this merchant
  const { data: rawApiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Log for debugging
  if (apiKeysError) {
    console.error('[DEBUG] Error fetching API keys:', apiKeysError)
  }
  console.log('[DEBUG] Raw API keys from DB:', JSON.stringify(rawApiKeys, null, 2))
  console.log('[DEBUG] Merchant ID:', merchantId)
  console.log('[DEBUG] User ID:', user.id)

  // Transform the API keys to match the frontend interface
  const apiKeys = rawApiKeys?.map(key => {
    if (key.key_type === 'public') {
      return {
        id: key.id,
        key: key.public_key || '',
        type: 'public' as const,
        name: key.name,
        is_active: key.is_active,
        last_used_at: key.last_used_at,
        created_at: key.created_at,
        key_prefix: 'pk_live_'
      }
    } else {
      // For secret keys, we need to show the prefix and masked version
      // Note: We can't show the full secret key as it's hashed
      return {
        id: key.id,
        key: key.secret_key_prefix ? key.secret_key_prefix + '•'.repeat(28) : 'sk_live_••••••••••••••••••••••••••••',
        type: 'secret' as const,
        name: key.name,
        is_active: key.is_active,
        last_used_at: key.last_used_at,
        created_at: key.created_at,
        key_prefix: key.secret_key_prefix || 'sk_live_'
      }
    }
  }) || []

  console.log('[DEBUG] Transformed API keys:', JSON.stringify(apiKeys, null, 2))
  console.log('[DEBUG] API keys count:', apiKeys.length)

  // Fetch webhooks count
  const { count: webhooksCount } = await supabase
    .from('webhooks')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('is_active', true)

  return (
    <DesarrolladoresClient
      merchantId={merchantId}
      apiKeys={apiKeys}
      webhooksCount={webhooksCount || 0}
    />
  )
}
