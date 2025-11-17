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
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch webhooks count
  const { count: webhooksCount } = await supabase
    .from('webhooks')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('is_active', true)

  return (
    <DesarrolladoresClient
      merchantId={merchantId}
      apiKeys={apiKeys || []}
      webhooksCount={webhooksCount || 0}
    />
  )
}
