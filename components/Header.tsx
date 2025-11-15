'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import AccountMenu from './AccountMenu'

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

  return (
    <header className="glass sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--color-border)]">
      {/* Breadcrumbs - Responsive with space for hamburger */}
      <div className="flex items-center gap-2 text-sm pl-12 lg:pl-0">
        <span className="text-[var(--color-textSecondary)] hidden sm:inline">Dashboard</span>
        <ChevronRight size={16} className="text-[var(--color-textSecondary)] hidden sm:inline" />
        <span className="text-[var(--color-textPrimary)] font-semibold">
          {pageName}
        </span>
      </div>

      {/* Right side - Theme toggle & Account menu */}
      <div className="flex items-center gap-3">
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

        {/* Account Menu Dropdown */}
        <AccountMenu merchantId={merchantId} userEmail={userEmail} />
      </div>
    </header>
  )
}
