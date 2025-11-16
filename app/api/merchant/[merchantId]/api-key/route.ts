import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(
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

    // Get the active secret API key for this merchant
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('key')
      .eq('merchant_id', merchantId)
      .eq('type', 'secret')
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

    return NextResponse.json({ api_key: apiKey.key })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
