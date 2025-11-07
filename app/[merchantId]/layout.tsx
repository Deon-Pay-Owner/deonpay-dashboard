import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default async function MerchantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('https://deonpay.mx/signin')
  }

  // Verify user has access to merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('owner_user_id, name')
    .eq('id', merchantId)
    .single()

  if (!merchant || merchant.owner_user_id !== user.id) {
    // User doesn't have access, redirect to their default merchant or signin
    const { data: userProfile } = await supabase
      .from('users_profile')
      .select('default_merchant_id')
      .eq('user_id', user.id)
      .single()

    if (userProfile?.default_merchant_id && userProfile.default_merchant_id !== merchantId) {
      redirect(`/${userProfile.default_merchant_id}/general`)
    }

    redirect('https://deonpay.mx/signin')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar merchantId={merchantId} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header merchantId={merchantId} userEmail={user.email} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
