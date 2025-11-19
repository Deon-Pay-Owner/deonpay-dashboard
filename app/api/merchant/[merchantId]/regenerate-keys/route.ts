import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params

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

    // Call the generate_api_keys function twice (once for public, once for secret)
    const { data: publicKeyResult, error: publicKeyError } = await supabase
      .rpc('generate_api_keys', {
        p_merchant_id: merchantId,
        p_key_type: 'public',
        p_name: 'Public Key'
      })
      .single<{ key: string; prefix: string }>()

    if (publicKeyError || !publicKeyResult) {
      console.error('Error generating public key:', publicKeyError)
      return NextResponse.json(
        { error: 'Failed to generate public key' },
        { status: 500 }
      )
    }

    const { data: secretKeyResult, error: secretKeyError } = await supabase
      .rpc('generate_api_keys', {
        p_merchant_id: merchantId,
        p_key_type: 'secret',
        p_name: 'Secret Key'
      })
      .single<{ key: string; prefix: string }>()

    if (secretKeyError || !secretKeyResult) {
      console.error('Error generating secret key:', secretKeyError)
      return NextResponse.json(
        { error: 'Failed to generate secret key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API keys regenerated successfully',
      public_key: publicKeyResult.key,
      secret_key: secretKeyResult.key,
      secret_key_prefix: secretKeyResult.prefix,
    })
  } catch (error) {
    console.error('Error regenerating API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
