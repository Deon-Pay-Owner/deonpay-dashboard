import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default async function DashboardRootPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  // If not authenticated, redirect to signin
  if (userError || !user) {
    redirect('https://deonpay.mx/signin')
  }

  // Get user's default merchant
  const { data: profile } = await supabase
    .from('users_profile')
    .select('default_merchant_id')
    .eq('user_id', user.id)
    .single()

  // If user has a merchant, redirect to it
  if (profile?.default_merchant_id) {
    redirect(`/${profile.default_merchant_id}`)
  }

  // If no merchant found, redirect to signin
  redirect('https://deonpay.mx/signin')
}
