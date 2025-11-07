'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, LogOut } from 'lucide-react'

interface HeaderProps {
  merchantId: string
  userEmail?: string
}

export default function Header({ merchantId, userEmail }: HeaderProps) {
  const pathname = usePathname()

  // Extract current page name from pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const currentPage = pathParts[pathParts.length - 1] || 'general'
  const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

  const handleSignOut = async () => {
    // Redirect to landing for sign out
    window.location.href = 'https://deonpay.mx/signin'
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Dashboard</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="text-gray-900 font-medium">{pageName}</span>
      </div>

      {/* User menu */}
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-sm text-gray-700 hidden sm:block">
            {userEmail}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
