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

    // STEP 1: Get all active public API keys for this merchant
    // This is the source of truth - if api_keys exist, merchant exists
    console.log('[DEBUG] Fetching API keys for merchant:', {
      merchantId,
      userId: user.id,
      userEmail: user.email,
    })

    const { data: apiKeys, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('public_key, key_type, is_active, created_at')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'public')
      .eq('is_active', true)
      .not('public_key', 'is', null)
      .order('created_at', { ascending: false })

    console.log('[DEBUG] API keys query result:', {
      merchantId,
      hasError: !!apiKeyError,
      error: apiKeyError,
      keysCount: apiKeys?.length || 0,
      keys: apiKeys?.map(k => ({
        prefix: k.public_key?.substring(0, 15) + '...',
        keyType: k.key_type,
        isActive: k.is_active,
      })),
    })

    // STEP 2: If no API keys found, return 404
    if (apiKeyError || !apiKeys || apiKeys.length === 0) {
      console.error('[ERROR] No API keys found:', {
        merchantId,
        apiKeyError,
        hasData: !!apiKeys,
        dataLength: apiKeys?.length,
      })
      return NextResponse.json(
        { error: 'No active public API keys found for this merchant' },
        { status: 404 }
      )
    }

    // STEP 3: Optional - verify merchant ownership for additional security
    // But don't fail if merchants table query fails - api_keys is source of truth
    const { data: merchant } = await supabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    // Only check ownership if we successfully retrieved merchant record
    if (merchant && merchant.owner_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
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
