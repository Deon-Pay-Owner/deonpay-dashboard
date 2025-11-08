import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const deleteSchema = z.object({
  confirmEmail: z.string().email('Email inválido'),
})

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Delete Account] Request received')

    // Validate input
    const { confirmEmail } = deleteSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[Delete Account] User not authenticated')
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verify email matches
    if (user.email !== confirmEmail) {
      console.log('[Delete Account] Email mismatch')
      return NextResponse.json(
        { error: 'El email no coincide con tu cuenta' },
        { status: 400 }
      )
    }

    console.log('[Delete Account] Deleting account for user:', user.id)

    // 1. Get user's merchants (to delete them)
    const { data: merchants } = await supabase
      .from('merchants')
      .select('id')
      .eq('owner_user_id', user.id)

    // 2. Delete merchant members (CASCADE will handle this, but explicit is better)
    if (merchants && merchants.length > 0) {
      const merchantIds = merchants.map(m => m.id)
      await supabase
        .from('merchant_members')
        .delete()
        .in('merchant_id', merchantIds)

      console.log('[Delete Account] Deleted merchant members')
    }

    // 3. Delete merchants (CASCADE will delete related records)
    const { error: merchantsError } = await supabase
      .from('merchants')
      .delete()
      .eq('owner_user_id', user.id)

    if (merchantsError) {
      console.error('[Delete Account] Error deleting merchants:', merchantsError)
    } else {
      console.log('[Delete Account] Deleted merchants')
    }

    // 4. Delete user profile
    const { error: profileError } = await supabase
      .from('users_profile')
      .delete()
      .eq('user_id', user.id)

    if (profileError) {
      console.error('[Delete Account] Error deleting profile:', profileError)
    } else {
      console.log('[Delete Account] Deleted profile')
    }

    // 5. Sign out the user (this invalidates the session)
    await supabase.auth.signOut()

    console.log('[Delete Account] Account deleted successfully')

    // Return success
    return NextResponse.json({
      ok: true,
      message: 'Tu cuenta ha sido eliminada exitosamente',
      redirectTo: process.env.NEXT_PUBLIC_LANDING_URL || 'https://deonpay.mx',
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('[Delete Account] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    )
  }
}
