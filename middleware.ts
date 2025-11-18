import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Prevent infinite redirect loops
const MAX_REDIRECTS = 3
const REDIRECT_COOKIE_NAME = 'dashboard_redirect_count'

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

            // Set secure httpOnly cookie for server
            supabaseResponse.cookies.set(name, value, {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: true,
              sameSite: 'lax',
            })

            // Also set a client-accessible cookie (without httpOnly) for browser client
            supabaseResponse.cookies.set(`${name}-client`, value, {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: false, // Client can read this
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
    error: userError
  } = await supabase.auth.getUser()

  // Debug logging
  console.log('[Dashboard Middleware]', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userError: userError?.message,
    cookies: request.cookies.getAll().map(c => c.name)
  })

  // If no user, redirect to landing signin
  if (!user) {
    const redirectUrl = new URL('https://deonpay.mx/signin')
    return NextResponse.redirect(redirectUrl)
  }

  // Extract merchantId from URL
  const merchantId = request.nextUrl.pathname.split('/')[1]

  // Verify user has access to merchant (optional but recommended)
  if (merchantId) {
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

    // Log for debugging
    console.log('[Middleware Debug]', {
      merchantId,
      userId: user.id,
      merchantData: merchant,
      merchantError: merchantError?.message
    })

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
