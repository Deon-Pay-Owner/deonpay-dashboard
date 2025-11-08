import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'
import { authenticateWithSecretKey } from '@/lib/webhook-auth'

// Schema de validación para actualizar webhook
const updateWebhookSchema = z.object({
  url: z.string().url('URL inválida').optional(),
  description: z.string().optional(),
  events: z.array(z.string()).min(1, 'Debe seleccionar al menos un evento').optional(),
  is_active: z.boolean().optional(),
})

// Función helper para verificar acceso
async function verifyAccess(webhookId: string, request: NextRequest, supabase: any) {
  // Try session-based auth first
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Session-based authentication
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('merchant_id, merchants(owner_user_id)')
      .eq('id', webhookId)
      .single()

    if (!webhook) {
      return { error: 'Webhook no encontrado', status: 404 }
    }

    if (webhook.merchants?.owner_user_id !== user.id) {
      return { error: 'No autorizado', status: 403 }
    }

    return { webhook, merchantId: webhook.merchant_id }
  }

  // Try API key authentication
  const authResult = await authenticateWithSecretKey(request)
  if (!authResult.authorized) {
    return { error: authResult.error, status: authResult.status }
  }

  // Verify webhook belongs to merchant
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('merchant_id')
    .eq('id', webhookId)
    .single()

  if (!webhook) {
    return { error: 'Webhook no encontrado', status: 404 }
  }

  if (webhook.merchant_id !== authResult.merchantId) {
    return { error: 'No autorizado', status: 403 }
  }

  return { webhook, merchantId: webhook.merchant_id }
}

// GET - Obtener un webhook específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const accessCheck = await verifyAccess(id, request, supabase)
    if (accessCheck.error) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      )
    }

    // Obtener webhook con sus eventos
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single()

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: 'Webhook no encontrado' },
        { status: 404 }
      )
    }

    // Obtener últimos eventos del webhook
    const { data: events } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('webhook_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ webhook, events: events || [] })
  } catch (error) {
    console.error('Error in GET /api/webhooks/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar webhook
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    // Validar datos
    const validationResult = updateWebhookSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const accessCheck = await verifyAccess(id, request, supabase)
    if (accessCheck.error) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      )
    }

    // Actualizar webhook
    const updateData: any = {}
    if (validationResult.data.url) updateData.url = validationResult.data.url
    if (validationResult.data.description !== undefined) updateData.description = validationResult.data.description
    if (validationResult.data.events) updateData.events = validationResult.data.events
    if (validationResult.data.is_active !== undefined) updateData.is_active = validationResult.data.is_active

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating webhook:', error)
      return NextResponse.json(
        { error: 'Error al actualizar webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ webhook })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in PATCH /api/webhooks/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const accessCheck = await verifyAccess(id, request, supabase)
    if (accessCheck.error) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      )
    }

    // Eliminar webhook (cascade eliminará los eventos asociados)
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting webhook:', error)
      return NextResponse.json(
        { error: 'Error al eliminar webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/webhooks/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
