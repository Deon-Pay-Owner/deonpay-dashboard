import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: true,
              sameSite: 'lax',
            })
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to landing signin
  if (!user) {
    const redirectUrl = new URL('https://deonpay.mx/signin')
    return NextResponse.redirect(redirectUrl)
  }

  // Extract merchantId from URL
  const merchantId = request.nextUrl.pathname.split('/')[1]

  // Verify user has access to merchant (optional but recommended)
  if (merchantId) {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    // If merchant doesn't exist or user doesn't have access
    if (!merchant) {
      // Redirect to 404 or default merchant
      const { data: userProfile } = await supabase
        .from('users_profile')
        .select('default_merchant_id')
        .eq('user_id', user.id)
        .single()

      if (userProfile?.default_merchant_id) {
        return NextResponse.redirect(
          new URL(`/${userProfile.default_merchant_id}/general`, request.url)
        )
      }

      // No default merchant, redirect to signin
      return NextResponse.redirect(new URL('https://deonpay.mx/signin', request.url))
    }

    // Check if user is owner or member
    const isOwner = merchant.owner_user_id === user.id

    // TODO: Add member check if you implement merchant_members table
    // const { data: member } = await supabase
    //   .from('merchant_members')
    //   .select('id')
    //   .eq('merchant_id', merchantId)
    //   .eq('user_id', user.id)
    //   .single()

    if (!isOwner) {
      // User doesn't have access to this merchant
      return NextResponse.redirect(
        new URL('https://deonpay.mx/signin', request.url)
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/:merchantId/:path*'],
}
