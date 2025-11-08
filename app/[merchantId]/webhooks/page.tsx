import { createClient } from '@/lib/supabase'
import WebhooksClient from './WebhooksClient'

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Obtener webhooks del merchant
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })

  return <WebhooksClient merchantId={merchantId} initialWebhooks={webhooks || []} />
}
