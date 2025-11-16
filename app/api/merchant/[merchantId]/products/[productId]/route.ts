import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string; productId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId, productId } = await params

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

    // Update product
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        unit_amount: body.unit_amount,
        currency: body.currency,
        type: body.type,
        recurring_interval: body.recurring_interval,
        recurring_interval_count: body.recurring_interval_count,
        active: body.active,
        metadata: body.metadata || {}
      })
      .eq('id', productId)
      .eq('merchant_id', merchantId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json(
        { error: { message: updateError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error in products PUT:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string; productId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId, productId } = await params

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

    // Delete product (soft delete by setting active = false)
    const { error: deleteError } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', productId)
      .eq('merchant_id', merchantId)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return NextResponse.json(
        { error: { message: deleteError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in products DELETE:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
