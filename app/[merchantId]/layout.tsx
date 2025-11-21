import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import ClientHeader from '@/components/ClientHeader'
import ApiKeyProvider from '@/components/ApiKeyProvider'

export default async function MerchantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Middleware already verified authentication and access
  // Just get user info for display
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If somehow no user (shouldn't happen due to middleware), redirect
  if (!user) {
    redirect('https://deonpay.mx/signin')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      {/* Load API key into localStorage on dashboard mount */}
      <ApiKeyProvider merchantId={merchantId} />

      {/* Sidebar */}
      <Sidebar merchantId={merchantId} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ClientHeader merchantId={merchantId} userEmail={user.email} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
          {children}
        </main>
      </div>
    </div>
  )
}
