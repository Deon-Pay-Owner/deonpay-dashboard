import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * POST /api/keys/revoke
 * Revoke (deactivate) an API key
 * Body: { merchantId: string, keyId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, keyId } = body

    if (!merchantId || !keyId) {
      return NextResponse.json(
        { error: 'merchantId and keyId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

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

    // Only owners can revoke keys
    if (membership.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only merchant owners can revoke API keys' },
        { status: 403 }
      )
    }

    // Verify the key belongs to this merchant
    const { data: existingKey, error: keyError } = await supabase
      .from('api_keys')
      .select('id, merchant_id')
      .eq('id', keyId)
      .single()

    if (keyError || !existingKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    if (existingKey.merchant_id !== merchantId) {
      return NextResponse.json(
        { error: 'This API key does not belong to the specified merchant' },
        { status: 403 }
      )
    }

    // Deactivate the key
    const { error: revokeError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)

    if (revokeError) {
      console.error('[API Keys] Error revoking key:', revokeError)
      return NextResponse.json(
        { error: 'Failed to revoke API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'API key revoked successfully',
    })
  } catch (error: any) {
    console.error('[API Keys] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
