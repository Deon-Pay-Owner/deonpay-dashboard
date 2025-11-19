import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Prevent infinite redirect loops
const MAX_REDIRECTS = 3
const REDIRECT_COOKIE_NAME = 'dashboard_redirect_count'

export async function middleware(request: NextRequest) {
  // Debug: Log all incoming cookies
  const allCookies = request.cookies.getAll()
  console.log('[DASHBOARD MIDDLEWARE] URL:', request.url)
  console.log('[DASHBOARD MIDDLEWARE] Incoming cookies:', allCookies.length, allCookies.map(c => c.name))

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
    error: authError,
  } = await supabase.auth.getUser()

  console.log('[DASHBOARD MIDDLEWARE] User:', user ? user.id : 'null')
  console.log('[DASHBOARD MIDDLEWARE] Auth error:', authError)

  // If no user, redirect to landing signin
  if (!user) {
    const redirectUrl = new URL('https://deonpay.mx/signin')
    return NextResponse.redirect(redirectUrl)
  }

  // Extract merchantId from URL
  const merchantId = request.nextUrl.pathname.split('/')[1]

  // Verify user has access to merchant (optional but recommended)
  if (merchantId) {
    console.log('[DASHBOARD MIDDLEWARE] Checking merchant access for:', merchantId)

    // Create service role client to bypass RLS for merchant lookup
    // Using createClient (not createServerClient) to ensure RLS is bypassed
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: merchant, error: merchantError } = await serviceSupabase
      .from('merchants')
      .select('owner_user_id')
      .eq('id', merchantId)
      .single()

    console.log('[DASHBOARD MIDDLEWARE] Merchant query result:', { merchant, merchantError })

    // If merchant doesn't exist or user doesn't have access
    if (!merchant) {
      // Check for redirect loop
      const redirectCount = parseInt(request.cookies.get(REDIRECT_COOKIE_NAME)?.value || '0')

      if (redirectCount >= MAX_REDIRECTS) {
        // Too many redirects - clear cookie and show error page
        const response = new NextResponse('Access denied. Unable to access dashboard. Please contact support or try signing in again.', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
          }
        })
        response.cookies.delete(REDIRECT_COOKIE_NAME)
        return response
      }

      // Redirect to 404 or default merchant
      const { data: userProfile } = await supabase
        .from('users_profile')
        .select('default_merchant_id')
        .eq('user_id', user.id)
        .single()

      if (userProfile?.default_merchant_id) {
        const redirectResponse = NextResponse.redirect(
          new URL(`/${userProfile.default_merchant_id}/general`, request.url)
        )
        // Increment redirect counter
        redirectResponse.cookies.set(REDIRECT_COOKIE_NAME, (redirectCount + 1).toString(), {
          maxAge: 10, // Cookie expires in 10 seconds
          httpOnly: true,
          sameSite: 'lax'
        })
        return redirectResponse
      }

      // No default merchant, redirect to signin (and clear counter)
      const signinResponse = NextResponse.redirect(new URL('https://deonpay.mx/signin', request.url))
      signinResponse.cookies.delete(REDIRECT_COOKIE_NAME)
      return signinResponse
    }

    // Success - clear redirect counter if it exists
    supabaseResponse.cookies.delete(REDIRECT_COOKIE_NAME)

    // Check if user is owner or member
    const isOwner = merchant.owner_user_id === user.id
    console.log('[DASHBOARD MIDDLEWARE] Ownership check:', {
      merchantOwnerId: merchant.owner_user_id,
      userId: user.id,
      isOwner
    })

    // TODO: Add member check if you implement merchant_members table
    // const { data: member } = await supabase
    //   .from('merchant_members')
    //   .select('id')
    //   .eq('merchant_id', merchantId)
    //   .eq('user_id', user.id)
    //   .single()

    if (!isOwner) {
      console.log('[DASHBOARD MIDDLEWARE] User is not owner, redirecting to signin')
      // User doesn't have access to this merchant
      return NextResponse.redirect(
        new URL('https://deonpay.mx/signin', request.url)
      )
    }
  }

  console.log('[DASHBOARD MIDDLEWARE] Access granted, allowing request')

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
}
