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
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar-bg text-sidebar-text"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-sidebar-bg text-sidebar-text
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-sidebar-hover">
            <h1 className="text-xl font-bold text-sidebar-text-active">DeonPay</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-sidebar-active text-sidebar-text-active'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-hover">
            <div className="text-xs text-sidebar-text">
              <p className="truncate">Merchant ID:</p>
              <p className="font-mono text-[10px] truncate">{merchantId}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
