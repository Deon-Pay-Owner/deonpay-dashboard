/**
 * User Management API - Update or remove team members
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// Update user role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { merchantId, role } = body

    if (!merchantId || !role) {
      return NextResponse.json(
        { error: 'merchantId and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'finance', 'developer', 'support', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
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

    // Check if current user is owner
    const { data: memberCheck } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!memberCheck || memberCheck.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can update team member roles' },
        { status: 403 }
      )
    }

    // Prevent changing own role
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Check if target user is owner
    const { data: targetMember } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      )
    }

    // Update role
    const { error: updateError } = await supabase
      .from('merchant_members')
      .update({ role })
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in user PATCH API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove user from team
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
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

    // Check if current user is owner
    const { data: memberCheck } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!memberCheck || memberCheck.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can remove team members' },
        { status: 403 }
      )
    }

    // Prevent removing self
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself. Use delete account instead.' },
        { status: 400 }
      )
    }

    // Check if target user is owner
    const { data: targetMember } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (targetMember?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove owner' },
        { status: 400 }
      )
    }

    // Update status to revoked instead of deleting
    const { error: revokeError } = await supabase
      .from('merchant_members')
      .update({ status: 'revoked' })
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)

    if (revokeError) {
      console.error('Error revoking access:', revokeError)
      return NextResponse.json(
        { error: 'Failed to remove team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in user DELETE API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
