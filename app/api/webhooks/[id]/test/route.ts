import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import crypto from 'crypto'

// POST - Enviar evento de prueba a un webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: webhookId } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Obtener webhook
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*, merchants(owner_user_id)')
      .eq('id', webhookId)
      .single()

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: 'Webhook no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el usuario sea dueño del merchant
    if (webhook.merchants?.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Verificar que el webhook esté activo
    if (!webhook.is_active) {
      return NextResponse.json(
        { error: 'El webhook está inactivo' },
        { status: 400 }
      )
    }

    // Crear payload de prueba
    const testPayload = {
      id: `evt_test_${crypto.randomBytes(12).toString('hex')}`,
      type: 'test.webhook',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      data: {
        object: {
          id: `test_${crypto.randomBytes(8).toString('hex')}`,
          type: 'test',
          message: 'Este es un evento de prueba enviado desde DeonPay',
          timestamp: new Date().toISOString(),
          webhook_id: webhookId,
        }
      }
    }

    // Generar firma HMAC
    const payloadString = JSON.stringify(testPayload)
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(payloadString)
      .digest('hex')

    // Registrar el intento en la base de datos
    const { data: eventRecord } = await supabase
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        merchant_id: webhook.merchant_id,
        event_type: 'test.webhook',
        payload: testPayload,
        attempt_count: 1,
        delivered: false,
      })
      .select()
      .single()

    // Enviar webhook
    try {
      const webhookResponse = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': testPayload.id,
          'X-DeonPay-Event': 'test.webhook',
          'User-Agent': 'DeonPay-Webhooks/1.0',
        },
        body: payloadString,
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      })

      const responseText = await webhookResponse.text()
      const delivered = webhookResponse.ok

      // Actualizar evento con la respuesta
      if (eventRecord) {
        await supabase
          .from('webhook_events')
          .update({
            response_status: webhookResponse.status,
            response_body: responseText.substring(0, 5000), // Limitar a 5000 caracteres
            delivered,
            delivered_at: delivered ? new Date().toISOString() : null,
          })
          .eq('id', eventRecord.id)
      }

      return NextResponse.json({
        success: true,
        event_id: testPayload.id,
        response_status: webhookResponse.status,
        delivered,
        message: delivered
          ? 'Evento de prueba enviado exitosamente'
          : 'El webhook respondió con un error',
      })
    } catch (fetchError: any) {
      // Error al enviar (timeout, red, etc.)
      if (eventRecord) {
        await supabase
          .from('webhook_events')
          .update({
            response_status: 0,
            response_body: fetchError.message || 'Error de red o timeout',
            delivered: false,
          })
          .eq('id', eventRecord.id)
      }

      return NextResponse.json({
        success: false,
        event_id: testPayload.id,
        error: fetchError.message || 'Error al enviar webhook',
        message: 'No se pudo conectar con el endpoint del webhook',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/webhooks/[id]/test:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
