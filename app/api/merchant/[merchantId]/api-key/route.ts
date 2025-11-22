import { NextRequest, NextResponse } from 'next/server'
import { createApiClient, createServiceClient } from '@/lib/supabase'

interface ApiKey {
  public_key: string
  key_type: string
  is_active: boolean
  created_at: string
}

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

    // Use createApiClient for authentication
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
    // Use service client to bypass RLS (api_keys table has RLS policies)
    // This is the source of truth - if api_keys exist, merchant exists
    const serviceClient = await createServiceClient()

    const { data: rawApiKeys, error: apiKeyError } = await serviceClient
      .from('api_keys')
      .select('public_key, key_type, is_active, created_at')
      .eq('merchant_id', merchantId)
      .eq('key_type', 'public')
      .eq('is_active', true)
      .not('public_key', 'is', null)
      .order('created_at', { ascending: false })

    // Type cast the result
    const apiKeys = rawApiKeys as ApiKey[] | null

    // STEP 2: If no API keys found, return 404
    if (apiKeyError || !apiKeys || apiKeys.length === 0) {
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
