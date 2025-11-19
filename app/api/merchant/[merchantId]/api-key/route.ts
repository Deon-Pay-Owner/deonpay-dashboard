import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'

/**
 * DEPRECATED: This endpoint cannot return the full secret key anymore
 * because secret keys are now hashed in the database.
 * Use the regenerate-keys endpoint to get a new secret key.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params

    // Create a mutable response
    const response = NextResponse.json({ data: null })

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

    // Get the active public API key for this merchant (we can show this one)
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('public_key, secret_key_prefix')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'public')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (apiKeyError || !apiKey) {
      return NextResponse.json(
        { error: 'No active API key found. Please create an API key first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      api_key: apiKey.public_key,
      note: 'Secret keys are now hashed and cannot be retrieved. Use /regenerate-keys to get a new secret key.'
    })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
