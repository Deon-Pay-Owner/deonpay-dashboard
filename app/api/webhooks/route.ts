import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/webhook-auth'

// Schema de validación para crear webhook
const createWebhookSchema = z.object({
  url: z.string().url('URL inválida'),
  description: z.string().optional(),
  events: z.array(z.string()).min(1, 'Debe seleccionar al menos un evento'),
})

// GET - Listar todos los webhooks del merchant
export async function GET(request: NextRequest) {
  try {
    // Authenticate using session or secret key
    const authResult = await authenticateRequest(request)
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      )
    }

    const merchantId = authResult.merchantId!
    const supabase = await createClient()

    // Obtener webhooks
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching webhooks:', error)
      return NextResponse.json(
        { error: 'Error al obtener webhooks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Error in GET /api/webhooks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validationResult = createWebhookSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { url, description, events } = validationResult.data

    // Authenticate using session or secret key
    // For session auth, merchantId comes from body
    // For API key auth, merchantId comes from the authenticated key
    const { merchantId: bodyMerchantId } = body

    // Create a modified request with merchantId in query for authenticateRequest
    const requestUrl = new URL(request.url)
    if (bodyMerchantId) {
      requestUrl.searchParams.set('merchantId', bodyMerchantId)
    }
    const modifiedRequest = new Request(requestUrl, {
      headers: request.headers,
      method: request.method,
    }) as NextRequest

    const authResult = await authenticateRequest(modifiedRequest)
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      )
    }

    const merchantId = authResult.merchantId!
    const supabase = await createClient()

    // Generar secret para el webhook
    const { data: secretData } = await supabase.rpc('generate_webhook_secret')
    const secret = secretData || `whsec_${Math.random().toString(36).substring(2, 15)}`

    // Crear webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        merchant_id: merchantId,
        url,
        description: description || null,
        events,
        secret,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating webhook:', error)
      return NextResponse.json(
        { error: 'Error al crear webhook' },
        { status: 500 }
      )
    }

    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error in POST /api/webhooks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
