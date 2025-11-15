'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import Link from 'next/link'

type PaymentIntent = {
  id: string
  created_at: string
  amount: number
  currency: string
  status: string
  metadata?: Record<string, any> | null
  payment_method?: {
    type?: string
    brand?: string
    last4?: string
  }
  customer?: {
    name?: string
    email?: string
  }
  charges?: Array<{
    id: string
    status: string
    amount_captured?: number
    acquirer_reference?: string
  }>
}

const ITEMS_PER_PAGE = 10

export default function TransaccionesClient({
  merchantId,
}: {
  merchantId: string
}) {
  const [transactions, setTransactions] = useState<PaymentIntent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  useEffect(() => {
    loadTransactions()
  }, [merchantId, currentPage])

  async function loadTransactions() {
    setLoading(true)
    try {
      const supabase = createClient()

      // Calculate offset
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('payment_intents')
        .select('*', { count: 'exact' })
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setTransactions(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((txn) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        txn.id.toLowerCase().includes(search) ||
        txn.customer?.name?.toLowerCase().includes(search) ||
        txn.customer?.email?.toLowerCase().includes(search) ||
        (txn.metadata?.order_id && String(txn.metadata.order_id).toLowerCase().includes(search))

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== 'all' && txn.status !== statusFilter) {
      return false
    }

    // Date filter
    if (dateFilter !== 'all') {
      const txnDate = new Date(txn.created_at)
      const now = new Date()

      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (txnDate < today) return false
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (txnDate < weekAgo) return false
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        if (txnDate < monthAgo) return false
      }
    }

    // Method filter
    if (methodFilter !== 'all') {
      if (methodFilter === 'card' && txn.payment_method?.type !== 'card') {
        return false
      }
      // Add more payment method types as needed
    }

    return true
  })

  const clearFilters = () => {
    setStatusFilter('all')
    setDateFilter('all')
    setMethodFilter('all')
  }

  const hasActiveFilters = statusFilter !== 'all' || dateFilter !== 'all' || methodFilter !== 'all'

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      succeeded: {
        label: 'Exitoso',
        className:
          'bg-[var(--color-success)]/20 text-[var(--color-success)]',
      },
      processing: {
        label: 'Procesando',
        className:
          'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
      },
      requires_payment_method: {
        label: 'Pendiente',
        className:
          'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]',
      },
      requires_confirmation: {
        label: 'Requiere confirm.',
        className:
          'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]',
      },
      requires_action: {
        label: 'Requiere acción',
        className:
          'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
      },
      canceled: {
        label: 'Cancelado',
        className:
          'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]',
      },
      failed: {
        label: 'Fallido',
        className: 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]',
      },
    }

    const config =
      statusConfig[status] || statusConfig['requires_payment_method']

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  const getPaymentMethod = (payment_method?: PaymentIntent['payment_method']) => {
    if (!payment_method) return 'N/A'

    if (payment_method.type === 'card') {
      const brand = payment_method.brand || 'Card'
      const last4 = payment_method.last4 || '****'
      return `${brand} •••• ${last4}`
    }

    return payment_method.type || 'N/A'
  }

  const getOrderId = (metadata?: PaymentIntent['metadata']) => {
    if (!metadata || !metadata.order_id) return 'N/A'
    return String(metadata.order_id)
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
            Transacciones
          </h1>
          <p className="text-[var(--color-textSecondary)]">
            Historial completo de todas tus transacciones
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => {
            alert('Exportación en desarrollo')
          }}
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)] pointer-events-none z-10"
            />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, email, orderId..."
              className="input-field pl-11 w-full"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center justify-center gap-2 relative ${hasActiveFilters ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : ''}`}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-primary)] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Todos</option>
                  <option value="succeeded">Exitoso</option>
                  <option value="processing">Procesando</option>
                  <option value="requires_payment_method">Pendiente</option>
                  <option value="requires_confirmation">Requiere confirmación</option>
                  <option value="requires_action">Requiere acción</option>
                  <option value="canceled">Cancelado</option>
                  <option value="failed">Fallido</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                  Período
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Todos</option>
                  <option value="today">Hoy</option>
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                  Método de pago
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="all">Todos</option>
                  <option value="card">Tarjeta</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden landscape:table-cell md:table-cell">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                    <p className="text-[var(--color-textSecondary)] mt-4">
                      Cargando transacciones...
                    </p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <CreditCard
                      size={48}
                      className="mx-auto mb-4 text-[var(--color-border)]"
                    />
                    <p className="text-[var(--color-textSecondary)] font-medium mb-2">
                      {searchTerm || hasActiveFilters
                        ? 'No se encontraron transacciones'
                        : 'No hay transacciones aún'}
                    </p>
                    <p className="text-sm text-[var(--color-textSecondary)] opacity-70">
                      {searchTerm || hasActiveFilters
                        ? 'Intenta con otros términos de búsqueda o filtros'
                        : 'Las transacciones aparecerán aquí cuando proceses tu primer pago'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => {
                      window.location.href = `/${merchantId}/transacciones/${txn.id}`
                    }}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary)]/5 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-sm">
                      <Link
                        href={`/${merchantId}/transacciones/${txn.id}`}
                        className="font-mono text-[var(--color-primary)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {txn.id.substring(0, 12)}...
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-textSecondary)] hidden landscape:table-cell md:table-cell">
                      <span className="font-mono">
                        {getOrderId(txn.metadata)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-textSecondary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-textPrimary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                      {txn.customer?.name || txn.customer?.email || 'Sin cliente'}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(txn.status)}</td>
                    <td className="py-3 px-4 text-sm text-[var(--color-textSecondary)] hidden portrait:md:hidden landscape:table-cell md:table-cell">
                      {getPaymentMethod(txn.payment_method)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-textSecondary)]">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} transacciones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-[var(--color-textPrimary)] px-3">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
