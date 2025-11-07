'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

interface HeaderProps {
  merchantId: string
  userEmail?: string
}

export default function Header({ merchantId, userEmail }: HeaderProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract current page name from pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const currentPage = pathParts[pathParts.length - 1] || 'general'
  const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1)

  const handleSignOut = async () => {
    // Redirect to landing for sign out
    window.location.href = 'https://deonpay.mx/signin'
  }

  return (
    <header className="glass sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--color-border)] backdrop-blur-md">
      {/* Breadcrumbs - Responsive with space for hamburger */}
      <div className="flex items-center gap-2 text-sm pl-12 lg:pl-0">
        <span className="text-[var(--color-textSecondary)] hidden sm:inline">Dashboard</span>
        <ChevronRight size={16} className="text-[var(--color-textSecondary)] hidden sm:inline" />
        <span className="text-[var(--color-textPrimary)] font-semibold">
          {pageName}
        </span>
      </div>

      {/* Right side - User menu & theme toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User email - Hidden on mobile */}
        {userEmail && (
          <span className="text-sm text-[var(--color-textSecondary)] hidden md:block truncate max-w-[200px]">
            {userEmail}
          </span>
        )}

        {/* Theme Toggle Button - Modern glassmorphism */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass-strong hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md group"
            aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'light' ? (
              <Moon
                size={18}
                className="text-[var(--color-textPrimary)] group-hover:rotate-12 transition-transform duration-300"
              />
            ) : (
              <Sun
                size={18}
                className="text-[var(--color-primary)] group-hover:rotate-90 transition-transform duration-300"
              />
            )}
          </button>
        )}

        {/* Sign out button - Modern design */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl glass-strong hover:bg-[var(--color-danger)]/10 hover:border-[var(--color-danger)]/30 transition-all duration-200 group shadow-sm hover:shadow-md"
          title="Cerrar sesión"
        >
          <LogOut
            size={18}
            className="text-[var(--color-textSecondary)] group-hover:text-[var(--color-danger)] transition-colors"
          />
          <span className="hidden sm:inline text-sm font-medium text-[var(--color-textPrimary)] group-hover:text-[var(--color-danger)] transition-colors">
            Salir
          </span>
        </button>
      </div>
    </header>
  )
}
