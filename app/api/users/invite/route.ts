/**
 * Users Invite API - Send invitation to join merchant team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, email, role } = body

    if (!merchantId || !email || !role) {
      return NextResponse.json(
        { error: 'merchantId, email, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'finance', 'developer', 'support', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Cannot invite as owner.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create a mutable response
    const response = NextResponse.json({ success: true })

    // Use createApiClient for proper cookie handling
    const supabase = createApiClient(request, response)

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
        { error: 'Only owners can invite team members' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('merchant_members')
      .select('id, role, status')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .single()

    if (existingMember && existingMember.status === 'active') {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('merchant_invitations')
      .select('id, status')
      .eq('merchant_id', merchantId)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('merchant_invitations')
      .insert({
        merchant_id: merchantId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // TODO: Send email notification with invitation link
    // For now, we'll just return the invitation token
    const invitationUrl = `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/invite/${invitation.token}`

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitationUrl,
        expiresAt: invitation.expires_at,
      },
    })
  } catch (error) {
    console.error('Error in invite API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all invitations for a merchant
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
        { error: 'Only owners can view invitations' },
        { status: 403 }
      )
    }

    // Get all pending invitations
    const { data: invitations, error } = await supabase
      .from('merchant_invitations')
      .select('*')
      .eq('merchant_id', merchantId)
      .in('status', ['pending', 'expired'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error in invitations GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
