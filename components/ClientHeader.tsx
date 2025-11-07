'use client'

import { useEffect, useState } from 'react'
import Header from './Header'

interface ClientHeaderProps {
  merchantId: string
  userEmail?: string
}

export default function ClientHeader({ merchantId, userEmail }: ClientHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on the server
  if (!mounted) {
    return (
      <div className="glass sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--color-border)] backdrop-blur-md">
        {/* Placeholder durante SSR */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-textPrimary)] font-semibold">Cargando...</span>
        </div>
      </div>
    )
  }

  return <Header merchantId={merchantId} userEmail={userEmail} />
}
