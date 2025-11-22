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

    // Get all active public API keys for this merchant
    const { data: apiKeys, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('public_key, key_type, is_active, created_at')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'public')
      .eq('is_active', true)
      .not('public_key', 'is', null)
      .order('created_at', { ascending: false })

    if (apiKeyError || !apiKeys || apiKeys.length === 0) {
      return NextResponse.json(
        { error: 'No active public API key found. Please create one in Developers.' },
        { status: 404 }
      )
    }

    // Prefer live keys over test keys
    const liveKey = apiKeys.find(k => k.public_key.startsWith('pk_live_'))
    const testKey = apiKeys.find(k => k.public_key.startsWith('pk_test_'))
    const selectedKey = liveKey || testKey || apiKeys[0]

    return NextResponse.json({
      api_key: selectedKey.public_key,
      mode: selectedKey.public_key.startsWith('pk_live_') ? 'live' : 'test',
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
