/**
 * Webhook Event Emission - Dashboard Integration
 *
 * This module provides helper functions to emit webhook events from the Dashboard.
 * Events are queued in the webhook_deliveries table and processed by the API Worker.
 */

import { createClient } from '@/lib/supabase'

export type EventType =
  // Payment Intent events
  | 'payment_intent.created'
  | 'payment_intent.processing'
  | 'payment_intent.requires_action'
  | 'payment_intent.succeeded'
  | 'payment_intent.failed'
  | 'payment_intent.canceled'
  // Charge events
  | 'charge.authorized'
  | 'charge.captured'
  | 'charge.failed'
  | 'charge.voided'
  // Refund events
  | 'refund.created'
  | 'refund.succeeded'
  | 'refund.failed'
  // Customer events
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'

export type EventPayload = {
  id: string // Event ID (UUID)
  type: EventType
  created: number // Unix timestamp
  data: {
    object: any
  }
}

/**
 * Emit a webhook event from the Dashboard
 *
 * This creates webhook_deliveries records for all merchant webhooks
 * subscribed to the event type. The API Worker's cron job will then
 * dispatch these webhooks.
 *
 * @param merchantId - Merchant ID
 * @param eventType - Type of event
 * @param data - Event data (customer, payment, etc.)
 */
export async function emitWebhookEvent(
  merchantId: string,
  eventType: EventType,
  data: any
): Promise<void> {
  try {
    const supabase = await createClient()

    // Generate event payload
    const eventId = crypto.randomUUID()
    const eventPayload: EventPayload = {
      id: eventId,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: data,
      },
    }

    console.log(`[Webhooks] Emitting event: ${eventType}`, {
      merchantId,
      eventId,
    })

    // Fetch merchant's active webhooks subscribed to this event type
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('id, url, secret, events')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)

    if (webhooksError) {
      console.error('[Webhooks] Error fetching webhooks:', webhooksError)
      // Don't throw - event emission failure shouldn't break the main flow
      return
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('[Webhooks] No active webhooks found for merchant', { merchantId })
      return
    }

    // Filter webhooks subscribed to this event type
    const subscribedWebhooks = webhooks.filter(
      (webhook) =>
        webhook.events.includes(eventType) || webhook.events.includes('*') // Support wildcard
    )

    if (subscribedWebhooks.length === 0) {
      console.log(`[Webhooks] No webhooks subscribed to ${eventType}`, { merchantId })
      return
    }

    console.log(
      `[Webhooks] Queuing deliveries for ${subscribedWebhooks.length} webhook(s)`,
      { eventType, merchantId }
    )

    // Create webhook_deliveries records
    const deliveries = subscribedWebhooks.map((webhook) => ({
      merchant_id: merchantId,
      event_type: eventType,
      event_id: eventId,
      endpoint_url: webhook.url,
      payload: eventPayload,
      attempt: 1,
      max_attempts: 3, // Will retry up to 3 times
      delivered: false,
    }))

    const { error: deliveriesError } = await supabase
      .from('webhook_deliveries')
      .insert(deliveries)

    if (deliveriesError) {
      console.error('[Webhooks] Error creating webhook deliveries:', deliveriesError)
      // Don't throw - just log the error
    } else {
      console.log(`[Webhooks] Created ${deliveries.length} webhook delivery records`)
    }
  } catch (error) {
    console.error('[Webhooks] Error emitting event:', error)
    // Don't throw - event emission should never break the main flow
  }
}

/**
 * Emit customer.created event
 */
export async function emitCustomerCreated(
  merchantId: string,
  customer: any
): Promise<void> {
  await emitWebhookEvent(merchantId, 'customer.created', customer)
}

/**
 * Emit customer.updated event
 */
export async function emitCustomerUpdated(
  merchantId: string,
  customer: any
): Promise<void> {
  await emitWebhookEvent(merchantId, 'customer.updated', customer)
}

/**
 * Emit customer.deleted event
 */
export async function emitCustomerDeleted(
  merchantId: string,
  customer: any
): Promise<void> {
  await emitWebhookEvent(merchantId, 'customer.deleted', customer)
}
