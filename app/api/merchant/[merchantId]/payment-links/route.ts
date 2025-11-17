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

    // Build line_items array
    const lineItems = [{
      product_id: body.product_id,
      quantity: 1
    }]

    // Create payment link
    const { data: paymentLink, error: createError } = await supabase
      .from('payment_links')
      .insert({
        merchant_id: merchantId,
        line_items: lineItems,
        currency: body.currency || 'MXN',
        active: body.active !== undefined ? body.active : true,
        custom_url: body.custom_url,
        after_completion_url: body.after_completion?.redirect?.url,
        after_completion_message: body.after_completion?.hosted_confirmation?.custom_message,
        billing_address_collection: body.billing_address_collection || 'auto',
        phone_number_collection: body.phone_number_collection || false,
        type: 'payment'
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
      url: `https://link.deonpay.mx/${paymentLink.url_key}`
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
      .select('*')
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

    // Get all unique product IDs from line_items
    const productIds = new Set<string>()
    paymentLinks?.forEach(link => {
      const lineItems = link.line_items as Array<{ product_id: string }>
      lineItems?.forEach(item => {
        if (item.product_id) productIds.add(item.product_id)
      })
    })

    // Fetch all products in one query
    let productsMap = new Map()
    if (productIds.size > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', Array.from(productIds))

      products?.forEach(product => {
        productsMap.set(product.id, product)
      })
    }

    // Add URLs and products to each link
    const linksWithUrls = paymentLinks?.map(link => {
      const lineItems = link.line_items as Array<{ product_id: string }>
      const firstProduct = lineItems?.[0]?.product_id
        ? productsMap.get(lineItems[0].product_id)
        : null

      return {
        ...link,
        url: `https://link.deonpay.mx/${link.url_key}`,
        products: firstProduct
      }
    })

    return NextResponse.json({ data: linksWithUrls })
  } catch (error) {
    console.error('Error in payment-links GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
