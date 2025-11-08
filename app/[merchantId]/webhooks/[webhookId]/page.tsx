import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import WebhookDetailClient from './WebhookDetailClient'

export default async function WebhookDetailPage({
  params,
}: {
  params: Promise<{ merchantId: string; webhookId: string }>
}) {
  const { merchantId, webhookId } = await params
  const supabase = await createClient()

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  // Verificar que el merchant pertenece al usuario
  const { data: merchant } = await supabase
    .from('merchants')
    .select('owner_user_id')
    .eq('id', merchantId)
    .single()

  if (!merchant || merchant.owner_user_id !== user.id) {
    notFound()
  }

  // Obtener webhook
  const { data: webhook, error: webhookError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .eq('merchant_id', merchantId)
    .single()

  if (webhookError || !webhook) {
    notFound()
  }

  // Obtener eventos del webhook
  const { data: events } = await supabase
    .from('webhook_events')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <WebhookDetailClient
      merchantId={merchantId}
      webhook={webhook}
      initialEvents={events || []}
    />
  )
}
