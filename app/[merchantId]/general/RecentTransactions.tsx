'use client'

import { useState } from 'react'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Transaction = {
  id: string
  created_at: string
  amount: number
  currency: string
  status: string
  customer?: {
    name?: string
    email?: string
  }
}

const ITEMS_PER_PAGE = 5

export default function RecentTransactions({
  transactions,
  merchantId,
}: {
  transactions: Transaction[]
  merchantId: string
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = transactions.slice(startIndex, endIndex)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      succeeded: { label: 'Exitoso', className: 'bg-[var(--color-success)]/20 text-[var(--color-success)]' },
      processing: { label: 'Procesando', className: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' },
      requires_payment_method: { label: 'Pendiente', className: 'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]' },
      failed: { label: 'Fallido', className: 'bg-[var(--color-error)]/20 text-[var(--color-error)]' },
      canceled: { label: 'Cancelado', className: 'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]' },
    }
    const config = statusConfig[status] || statusConfig['requires_payment_method']
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-3">
      {currentTransactions.map((txn) => (
        <Link
          key={txn.id}
          href={`/${merchantId}/transacciones/${txn.id}`}
          className="block p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-[var(--color-textSecondary)] truncate">
                {txn.id}
              </p>
              <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                {formatDate(txn.created_at)}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="text-lg font-bold text-[var(--color-textPrimary)]">
                {formatCurrency(txn.amount, txn.currency)}
              </p>
              {getStatusBadge(txn.status)}
            </div>
          </div>
          {txn.customer && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
              <Users size={12} />
              <span className="truncate">
                {typeof txn.customer === 'object' && txn.customer !== null
                  ? txn.customer.email || txn.customer.name || 'Cliente'
                  : 'Cliente'}
              </span>
            </div>
          )}
        </Link>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-textSecondary)]">
            {startIndex + 1}-{Math.min(endIndex, transactions.length)} de {transactions.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-[var(--color-textSecondary)] px-2">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <Link
        href={`/${merchantId}/transacciones`}
        className="block text-center py-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
      >
        Ver todas las transacciones →
      </Link>
    </div>
  )
}
