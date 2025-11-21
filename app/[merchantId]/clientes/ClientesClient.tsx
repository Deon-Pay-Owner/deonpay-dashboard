'use client'

import { useState, useEffect } from 'react'
import { Search, UserPlus, Users as UsersIcon, Mail, Phone, Calendar } from 'lucide-react'
import NewCustomerModal from './NewCustomerModal'
import { customers as customersAPI } from '@/lib/api-client'

interface Customer {
  id: string
  email: string
  name: string | null
  phone: string | null
  total_spent: number
  transaction_count: number
  last_transaction_at: string | null
  created_at: string
}

interface Stats {
  total: number
  active: number
  newThisMonth: number
}

export default function ClientesClient({ merchantId }: { merchantId: string }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, newThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch customers
  useEffect(() => {
    fetchCustomers()
  }, [merchantId, searchDebounced])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      const params: { limit?: number; email?: string } = {
        limit: 100
      }

      if (searchDebounced) {
        params.email = searchDebounced
      }

      const { data, error } = await customersAPI.list(params)

      if (error) {
        throw new Error(error.message || 'Failed to fetch customers')
      }

      setCustomers(data || [])
      // Note: The API doesn't return stats, so we calculate them from the data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const newThisMonth = (data || []).filter(
        (c: Customer) => new Date(c.created_at) >= startOfMonth
      ).length
      const active = (data || []).filter((c: Customer) => c.transaction_count > 0).length

      setStats({
        total: (data || []).length,
        active,
        newThisMonth
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
      setStats({ total: 0, active: 0, newThisMonth: 0 })
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'

    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString))
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">Clientes</h1>
          <p className="text-[var(--color-textSecondary)]">
            Gestiona tu base de clientes y su información
          </p>
        </div>
        <button
          onClick={() => setShowNewCustomerModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)] pointer-events-none z-10"
          />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="input-field pl-11 w-full"
            style={{ paddingLeft: '2.75rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Total de clientes</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Clientes activos</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">{stats.active}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Nuevos este mes</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">{stats.newThisMonth}</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden sm:table-cell">
                  Teléfono
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">
                  Transacciones
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Total gastado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">
                  Última compra
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mb-4"></div>
                    <p className="text-[var(--color-textSecondary)]">Cargando clientes...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <UsersIcon size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
                    <p className="text-[var(--color-textSecondary)] font-medium mb-2">
                      {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                    </p>
                    <p className="text-sm text-[var(--color-textSecondary)] opacity-70 mb-4">
                      {search
                        ? 'Intenta con otro término de búsqueda'
                        : 'Los clientes se crearán automáticamente con cada transacción'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setShowNewCustomerModal(true)}
                        className="btn-primary mx-auto"
                      >
                        Crear primer cliente
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                  >
                    {/* Customer Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {(customer.name || customer.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-textPrimary)] truncate">
                            {customer.name || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-[var(--color-textSecondary)] truncate md:hidden">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-[var(--color-textSecondary)]">
                        <Mail size={14} className="flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 hidden sm:table-cell">
                      {customer.phone ? (
                        <div className="flex items-center gap-2 text-[var(--color-textSecondary)]">
                          <Phone size={14} className="flex-shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--color-textSecondary)] opacity-50">-</span>
                      )}
                    </td>

                    {/* Transaction Count */}
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-background)] text-[var(--color-textPrimary)]">
                        {customer.transaction_count}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[var(--color-textPrimary)]">
                        {formatPrice(customer.total_spent)}
                      </span>
                    </td>

                    {/* Last Transaction Date */}
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-[var(--color-textSecondary)]">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>{formatDate(customer.last_transaction_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-textSecondary)] mt-3 md:hidden">
          💡 Cambia a modo landscape para ver todas las columnas
        </p>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        merchantId={merchantId}
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onSuccess={fetchCustomers}
      />
    </div>
  )
}
