import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string; linkId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId, linkId } = await params

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

    // Build update object
    const updateData: any = {}

    if (body.active !== undefined) updateData.active = body.active
    if (body.custom_url !== undefined) updateData.custom_url = body.custom_url
    if (body.after_completion_url !== undefined) updateData.after_completion_url = body.after_completion_url
    if (body.after_completion_message !== undefined) updateData.after_completion_message = body.after_completion_message
    if (body.billing_address_collection !== undefined) updateData.billing_address_collection = body.billing_address_collection
    if (body.phone_number_collection !== undefined) updateData.phone_number_collection = body.phone_number_collection
    if (body.allow_promotion_codes !== undefined) updateData.allow_promotion_codes = body.allow_promotion_codes

    // Update payment link
    const { data: paymentLink, error: updateError } = await supabase
      .from('payment_links')
      .update(updateData)
      .eq('id', linkId)
      .eq('merchant_id', merchantId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment link:', updateError)
      return NextResponse.json(
        { error: { message: updateError.message } },
        { status: 500 }
      )
    }

    // Return with full URL
    return NextResponse.json({
      ...paymentLink,
      url: `https://link.deonpay.mx/${paymentLink.url_key}`
    })
  } catch (error) {
    console.error('Error in payment-links PUT:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string; linkId: string }> }
) {
  try {
    const supabase = await createClient()
    const { merchantId, linkId } = await params

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

    // Delete payment link (soft delete by setting active = false)
    const { error: deleteError } = await supabase
      .from('payment_links')
      .update({ active: false })
      .eq('id', linkId)
      .eq('merchant_id', merchantId)

    if (deleteError) {
      console.error('Error deleting payment link:', deleteError)
      return NextResponse.json(
        { error: { message: deleteError.message } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in payment-links DELETE:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
