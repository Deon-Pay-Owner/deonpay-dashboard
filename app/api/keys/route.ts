import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

/**
 * GET /api/keys?merchantId=xxx
 * List all API keys for a merchant
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
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

    // Verify user has access to this merchant
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

    // Get API keys for this merchant
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys')
      .select('id, name, key_type, public_key, secret_key_prefix, is_active, last_used_at, expires_at, created_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (keysError) {
      console.error('[API Keys] Error fetching keys:', keysError)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      keys: apiKeys || [],
    })
  } catch (error: any) {
    console.error('[API Keys] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
