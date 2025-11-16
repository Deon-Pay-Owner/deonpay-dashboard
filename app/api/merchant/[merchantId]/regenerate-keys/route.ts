import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
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

    // Check if user is owner (can be expanded to check merchant_members later)
    if (merchant.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Deactivate existing keys
    const { error: deactivateError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('merchant_id', merchantId)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('Error deactivating keys:', deactivateError)
      return NextResponse.json(
        { error: 'Failed to deactivate existing keys' },
        { status: 500 }
      )
    }

    // Call the generate_api_key function twice (once for public, once for secret)
    const { data: publicKeyData, error: publicKeyError } = await supabase
      .rpc('generate_api_key', {
        p_merchant_id: merchantId,
        p_type: 'public',
        p_name: 'Public Key'
      })

    if (publicKeyError) {
      console.error('Error generating public key:', publicKeyError)
      return NextResponse.json(
        { error: 'Failed to generate public key' },
        { status: 500 }
      )
    }

    const { data: secretKeyData, error: secretKeyError } = await supabase
      .rpc('generate_api_key', {
        p_merchant_id: merchantId,
        p_type: 'secret',
        p_name: 'Secret Key'
      })

    if (secretKeyError) {
      console.error('Error generating secret key:', secretKeyError)
      return NextResponse.json(
        { error: 'Failed to generate secret key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API keys regenerated successfully',
      public_key: publicKeyData,
      secret_key_prefix: secretKeyData?.substring(0, 12) + '...',
    })
  } catch (error) {
    console.error('Error regenerating API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
