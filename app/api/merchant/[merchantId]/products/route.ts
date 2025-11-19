import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'

const API_WORKER_URL = process.env.NEXT_PUBLIC_DEONPAY_API_URL || 'https://pagos.deonpay.mx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params

    // Create a mutable response
    const response = NextResponse.json({ data: [] })

    // Use createApiClient for proper cookie handling
    const supabase = createApiClient(request, response)

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this merchant and get API key
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Check if user is owner
    if (merchant.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get merchant's secret key for API Worker authentication
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('secret_key')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'test') // Use test key for now
      .eq('is_active', true)
      .single()

    if (keyError || !apiKey || !apiKey.secret_key) {
      console.error('Error fetching API key:', keyError)
      return NextResponse.json(
        { error: 'Merchant API key not configured' },
        { status: 500 }
      )
    }

    // Forward request to API Worker
    const searchParams = request.nextUrl.searchParams
    const workerUrl = `${API_WORKER_URL}/api/v1/products?${searchParams.toString()}`

    const workerResponse = await fetch(workerUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.secret_key}`,
        'Content-Type': 'application/json',
      },
    })

    if (!workerResponse.ok) {
      const errorData = await workerResponse.json()
      console.error('API Worker error:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch products' },
        { status: workerResponse.status }
      )
    }

    const workerData = await workerResponse.json()

    // Worker returns { object: 'list', data: [...], has_more: bool }
    // Dashboard expects { data: [...] }
    return NextResponse.json({ data: workerData.data || [] })
  } catch (error) {
    console.error('Error in products GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params

    // Get request body first
    const body = await request.json()

    // Create a mutable response
    const response = NextResponse.json({ success: true })

    // Use createApiClient for proper cookie handling
    const supabase = createApiClient(request, response)

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Check if user is owner
    if (merchant.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get merchant's secret key for API Worker authentication
    const { data: apiKey, error: keyError } = await supabase
      .from('api_keys')
      .select('secret_key')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'test') // Use test key for now
      .eq('is_active', true)
      .single()

    if (keyError || !apiKey || !apiKey.secret_key) {
      console.error('Error fetching API key:', keyError)
      return NextResponse.json(
        { error: 'Merchant API key not configured' },
        { status: 500 }
      )
    }

    // Forward request to API Worker
    const workerUrl = `${API_WORKER_URL}/api/v1/products`

    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.secret_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!workerResponse.ok) {
      const errorData = await workerResponse.json()
      console.error('API Worker error:', errorData)
      return NextResponse.json(
        { error: errorData.error || { message: 'Failed to create product' } },
        { status: workerResponse.status }
      )
    }

    const product = await workerResponse.json()
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in products POST:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
