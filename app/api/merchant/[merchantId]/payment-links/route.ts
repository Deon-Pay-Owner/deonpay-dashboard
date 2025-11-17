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
        // Ensure custom_url is null if empty or undefined to avoid unique constraint conflicts
        custom_url: body.custom_url && body.custom_url.trim() !== '' ? body.custom_url.trim() : null,
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

      // Check if it's a duplicate custom_url error
      if (createError.code === '23505' && createError.message.includes('idx_payment_links_merchant_custom_url')) {
        return NextResponse.json(
          { error: { message: 'Esta URL personalizada ya está en uso. Por favor elige otra.' } },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: { message: createError.message } },
        { status: 500 }
      )
    }

    // Generate full URL for the payment link
    // Use custom_url if available, otherwise use the auto-generated url_key
    const urlSlug = paymentLink.custom_url || paymentLink.url_key
    const fullUrl = `https://link.deonpay.mx/${urlSlug}`

    // Generate QR code URL using QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(fullUrl)}`

    // Update payment link with QR code URL
    const { error: updateError } = await supabase
      .from('payment_links')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', paymentLink.id)

    if (updateError) {
      console.error('Error updating QR code:', updateError)
      // Don't fail the request, just log the error
    }

    // Return payment link with full URL and QR code
    return NextResponse.json({
      ...paymentLink,
      url: fullUrl,
      qr_code_url: qrCodeUrl
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

      // Use custom_url if available, otherwise use the payment link ID
      const urlSlug = link.custom_url || link.id
      const fullUrl = `https://link.deonpay.mx/${urlSlug}`
      const qrCodeUrl = link.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(fullUrl)}`

      return {
        ...link,
        url: fullUrl,
        qr_code_url: qrCodeUrl,
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
