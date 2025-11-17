import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { emitCustomerCreated } from '@/lib/webhooks'

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

    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('merchant_id', merchantId)
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: customers, error: customersError, count } = await query

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      )
    }

    // Get aggregated stats
    const { data: stats } = await supabase
      .from('customers')
      .select('transaction_count, created_at')
      .eq('merchant_id', merchantId)
      .eq('deleted', false)

    const totalCustomers = count || 0
    const activeCustomers = stats?.filter(c => c.transaction_count > 0).length || 0

    // Calculate new customers this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = stats?.filter(c =>
      new Date(c.created_at) >= firstDayOfMonth
    ).length || 0

    return NextResponse.json({
      data: customers,
      pagination: {
        total: totalCustomers,
        limit,
        offset,
      },
      stats: {
        total: totalCustomers,
        active: activeCustomers,
        newThisMonth,
      },
    })
  } catch (error) {
    console.error('Error in customers GET:', error)
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

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create customer
    const { data: customer, error: createError } = await supabase
      .from('customers')
      .insert({
        merchant_id: merchantId,
        email: body.email,
        name: body.name,
        phone: body.phone,
        billing_address: body.billing_address || {},
        shipping_address: body.shipping_address || {},
        metadata: body.metadata || {},
        description: body.description,
        tax_exempt: body.tax_exempt || false,
        currency: body.currency,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating customer:', createError)

      // Handle unique constraint violation
      if (createError.code === '23505') {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: { message: createError.message } },
        { status: 500 }
      )
    }

    // Emit customer.created webhook event
    await emitCustomerCreated(merchantId, customer)

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error in customers POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
