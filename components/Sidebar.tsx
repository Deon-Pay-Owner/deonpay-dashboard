'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Webhook,
  Code,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  merchantId: string
}

export default function Sidebar({ merchantId }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'General', href: `/${merchantId}/general`, icon: LayoutDashboard },
    { name: 'Transacciones', href: `/${merchantId}/transacciones`, icon: CreditCard },
    { name: 'Clientes', href: `/${merchantId}/clientes`, icon: Users },
    { name: 'Webhooks', href: `/${merchantId}/webhooks`, icon: Webhook },
    { name: 'Desarrolladores', href: `/${merchantId}/desarrolladores`, icon: Code },
    { name: 'Cuenta', href: `/${merchantId}/cuenta`, icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button - Fixed with glassmorphism */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          lg:hidden fixed top-3 z-50 p-2.5 rounded-lg glass-strong shadow-lg hover:scale-105 transition-all duration-300
          ${isOpen ? 'left-[260px]' : 'left-3'}
        `}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? (
          <X size={20} className="text-[var(--color-textPrimary)]" />
        ) : (
          <Menu size={20} className="text-[var(--color-textPrimary)]" />
        )}
      </button>

      {/* Backdrop for mobile with smooth transition */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Modern glassmorphism design */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 sidebar-glass
          transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Modern with gradient */}
          <div className="flex items-center gap-3 h-20 px-6 border-b border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] rounded-xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
              DeonPay
            </h1>
          </div>

          {/* Navigation - Smooth hover effects */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 relative overflow-hidden
                    ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-info)] rounded-r" />
                  )}

                  <div className={`
                    p-2 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-white/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                    }
                  `}>
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium text-[0.9375rem]">{item.name}</span>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              )
            })}
          </nav>

          {/* Footer - Compact merchant info */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="text-xs text-white/60 space-y-1">
              <p className="font-medium text-white/80">Merchant ID:</p>
              <p className="font-mono text-[10px] truncate bg-black/30 px-2 py-1 rounded">
                {merchantId}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thumb-white\/20::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .scrollbar-thumb-white\/20::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  )
}
