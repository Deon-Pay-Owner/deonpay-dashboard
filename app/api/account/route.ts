import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'
import { z } from 'zod'

const accountUpdateSchema = z.object({
  merchantId: z.string().uuid('ID de comercio inválido'),
  merchant_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres')
    .trim(),
  full_name: z
    .string()
    .min(2, 'Tu nombre debe tener al menos 2 caracteres')
    .max(80, 'Tu nombre no puede exceder 80 caracteres')
    .trim(),
  phone: z
    .string()
    .min(7, 'Teléfono debe tener al menos 7 dígitos')
    .max(20, 'Teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Teléfono contiene caracteres inválidos')
    .trim(),
})

/**
 * PATCH /api/account
 * Updates user profile and merchant information
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get request body first
    const body = await request.json()

    // Create a mutable response
    const response = NextResponse.json({ success: true })

    // Use createApiClient for proper cookie handling
    const supabase = createApiClient(request, response)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Parse and validate
    const { merchantId, merchant_name, full_name, phone } = accountUpdateSchema.parse(body)

    // Verify user has access to this merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    const { data: member } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)
      .single()

    const isOwner = merchant?.owner_user_id === userId
    const isMember = !!member

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar este comercio' },
        { status: 403 }
      )
    }

    // Update merchant name
    const { error: updateMerchantError } = await supabase
      .from('merchants')
      .update({ name: merchant_name })
      .eq('id', merchantId)

    if (updateMerchantError) {
      console.error('[Account Update] Failed to update merchant:', updateMerchantError)
      return NextResponse.json(
        { error: 'Error al actualizar el comercio' },
        { status: 500 }
      )
    }

    // Update user profile
    const { error: updateProfileError } = await supabase
      .from('users_profile')
      .update({
        full_name,
        phone,
      })
      .eq('user_id', userId)

    if (updateProfileError) {
      console.error('[Account Update] Failed to update profile:', updateProfileError)
      return NextResponse.json(
        { error: 'Error al actualizar el perfil' },
        { status: 500 }
      )
    }

    // Return success
    return NextResponse.json({
      ok: true,
      message: 'Cuenta actualizada exitosamente',
    })
  } catch (error: any) {
    console.error('[Account Update] Unexpected error:', error)

    if (error.errors) {
      // Zod validation error
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/account
 * Retrieves user account information for a specific merchant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId es requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const userId = user.id

    // Verify access to merchant
    const { data: merchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single()

    const { data: member } = await supabase
      .from('merchant_members')
      .select('role')
      .eq('merchant_id', merchantId)
      .eq('user_id', userId)
      .single()

    const isOwner = merchant?.owner_user_id === userId
    const isMember = !!member

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: 'No tienes permiso para acceder a este comercio' },
        { status: 403 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('full_name, phone, profile_type')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
      },
      profile: {
        full_name: profile.full_name,
        phone: profile.phone,
        profile_type: profile.profile_type,
      },
      email: user.email,
    })
  } catch (error: any) {
    console.error('[Account Get] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
