/**
 * Users API - Get team members for a merchant
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is owner
    const { data: memberCheck } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!memberCheck || memberCheck.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can view team members' },
        { status: 403 }
      )
    }

    // Get all team members with user details
    const { data: members, error } = await supabase
      .from('merchant_members')
      .select(`
        id,
        role,
        status,
        invited_at,
        accepted_at,
        created_at,
        user_id
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching members:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }

    // Get user details from auth.users (we'll need to fetch emails)
    const userIds = members.map(m => m.user_id)

    // Fetch user profiles to get emails
    const { data: profiles } = await supabase
      .from('users_profile')
      .select('user_id, email')
      .in('user_id', userIds)

    // Combine member data with user details
    const membersWithDetails = members.map(member => {
      const profile = profiles?.find(p => p.user_id === member.user_id)
      return {
        ...member,
        email: profile?.email || 'Unknown',
      }
    })

    return NextResponse.json({ members: membersWithDetails })
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
