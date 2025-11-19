import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          status: string
          onboarding_stage: string
          country: string
          currency: string
          channel: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          status?: string
          onboarding_stage?: string
          country?: string
          currency?: string
          channel?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          status?: string
          onboarding_stage?: string
          country?: string
          currency?: string
          channel?: string
          created_at?: string
          updated_at?: string
        }
      }
      users_profile: {
        Row: {
          user_id: string
          full_name: string
          phone: string
          profile_type: string
          default_merchant_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          phone: string
          profile_type: string
          default_merchant_id?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          phone?: string
          profile_type?: string
          default_merchant_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Client-side Supabase client for use in Client Components
// NOTE: Browser clients cannot read httpOnly cookies (which is correct for security)
// The session is maintained by the server-side middleware and passed via SSR
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Using default cookie handling - httpOnly cookies are handled by the browser automatically
  )
}
