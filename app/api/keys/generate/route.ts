import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'
import { generateMerchantKeys } from '@/lib/api-keys'

/**
 * POST /api/keys/generate
 * Generate new API keys for a merchant
 * Body: { merchantId: string, keyType: 'test' | 'live', name?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, keyType = 'test', name } = body

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    if (keyType !== 'test' && keyType !== 'live') {
      return NextResponse.json(
        { error: 'keyType must be either "test" or "live"' },
        { status: 400 }
      )
    }

    // Create a mutable response
    const response = NextResponse.json({ success: true })

    // Use createApiClient for proper cookie handling
    const supabase = createApiClient(request, response)

    // Get current user to verify they have access to this merchant
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this merchant and has owner/admin role
    const { data: membership, error: membershipError } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Access denied to this merchant' },
        { status: 403 }
      )
    }

    // Only owners can generate new keys
    if (membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only merchant owners can generate API keys' },
        { status: 403 }
      )
    }

    // Deactivate existing active keys of the same type
    const { error: deactivateError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('merchant_id', merchantId)
      .eq('key_type', keyType)
      .eq('is_active', true)

    if (deactivateError) {
      console.error('[API Keys] Error deactivating old keys:', deactivateError)
      return NextResponse.json(
        { error: 'Failed to deactivate old keys' },
        { status: 500 }
      )
    }

    // Generate new API keys
    const apiKeys = generateMerchantKeys(keyType)

    const keyName = name || `${keyType === 'test' ? 'Test' : 'Live'} Key - ${new Date().toLocaleDateString('es-MX')}`

    const { data: newKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        merchant_id: merchantId,
        name: keyName,
        key_type: keyType,
        public_key: apiKeys.publicKey,
        secret_key_hash: apiKeys.secretKeyHash,
        secret_key_prefix: apiKeys.secretKeyPrefix,
        is_active: true,
        created_by: user.id,
      })
      .select('id, name, key_type, public_key, secret_key_prefix, is_active, created_at')
      .single()

    if (insertError) {
      console.error('[API Keys] Error creating new keys:', insertError)
      return NextResponse.json(
        { error: 'Failed to create new API keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      key: newKey,
      secretKey: apiKeys.secretKey, // Only returned once!
      message: 'API keys generated successfully. Save the secret key now - it will not be shown again.',
    })
  } catch (error: any) {
    console.error('[API Keys] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
