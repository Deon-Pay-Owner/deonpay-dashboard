'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { User, Settings, UserCog, LogOut, ChevronDown } from 'lucide-react'

interface AccountMenuProps {
  merchantId: string
  userEmail?: string
  userRole?: string
}

export default function AccountMenu({ merchantId, userEmail, userRole = 'owner' }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    window.location.href = 'https://deonpay.mx/signin'
  }

  // Get initials from email
  const getInitials = (email?: string) => {
    if (!email) return 'U'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass-strong hover:bg-[var(--color-surface)]/50 transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
          {getInitials(userEmail)}
        </div>

        {/* Email - Hidden on mobile */}
        {userEmail && (
          <span className="hidden md:block text-sm text-[var(--color-textPrimary)] max-w-[150px] truncate">
            {userEmail}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`text-[var(--color-textSecondary)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 glass-strong rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden z-50 animate-slideDown">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-textPrimary)] truncate">
              {userEmail || 'Usuario'}
            </p>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              Merchant ID: {merchantId.substring(0, 8)}...
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href={`/${merchantId}/cuenta`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface)]/50 transition-colors"
            >
              <Settings size={18} className="text-[var(--color-textSecondary)]" />
              <span className="text-sm text-[var(--color-textPrimary)]">Configuración</span>
            </Link>

            {/* Only show Users option for owners */}
            {userRole === 'owner' && (
              <Link
                href={`/${merchantId}/cuenta/usuarios`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface)]/50 transition-colors"
              >
                <UserCog size={18} className="text-[var(--color-textSecondary)]" />
                <span className="text-sm text-[var(--color-textPrimary)]">Usuarios y Permisos</span>
              </Link>
            )}

            <div className="my-2 border-t border-[var(--color-border)]" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-danger)]/10 transition-colors text-left"
            >
              <LogOut size={18} className="text-[var(--color-danger)]" />
              <span className="text-sm text-[var(--color-danger)]">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
