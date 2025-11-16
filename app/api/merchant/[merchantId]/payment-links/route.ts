import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId } = await params

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

    // Get request body
    const body = await request.json()

    // Generate a unique link ID
    const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create payment link
    const { data: paymentLink, error: createError } = await supabase
      .from('payment_links')
      .insert({
        merchant_id: merchantId,
        product_id: body.product_id,
        link_id: linkId,
        name: body.name,
        description: body.description,
        amount: body.amount,
        currency: body.currency,
        active: body.active !== undefined ? body.active : true,
        metadata: body.metadata || {},
        max_uses: body.max_uses,
        expires_at: body.expires_at
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating payment link:', createError)
      return NextResponse.json(
        { error: { message: createError.message } },
        { status: 500 }
      )
    }

    // Return payment link with full URL
    return NextResponse.json({
      ...paymentLink,
      url: `https://checkout.deonpay.mx/${linkId}`
    })
  } catch (error) {
    console.error('Error in payment-links POST:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId } = await params

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const activeParam = searchParams.get('active')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    let query = supabase
      .from('payment_links')
      .select('*, products(*)')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by active status if specified
    if (activeParam !== null) {
      query = query.eq('active', activeParam === 'true')
    }

    const { data: paymentLinks, error: linksError } = await query

    if (linksError) {
      console.error('Error fetching payment links:', linksError)
      return NextResponse.json(
        { error: 'Failed to fetch payment links' },
        { status: 500 }
      )
    }

    // Add URLs to each link
    const linksWithUrls = paymentLinks?.map(link => ({
      ...link,
      url: `https://checkout.deonpay.mx/${link.link_id}`
    }))

    return NextResponse.json({ data: linksWithUrls })
  } catch (error) {
    console.error('Error in payment-links GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
