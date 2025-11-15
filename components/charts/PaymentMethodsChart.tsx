'use client'

import { CreditCard, Wallet } from 'lucide-react'

interface PaymentMethodData {
  method: string
  count: number
  percentage: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethodData[]
  title?: string
}

export default function PaymentMethodsChart({
  data,
  title = 'Métodos de pago'
}: PaymentMethodsChartProps) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="card-header">{title}</h3>
        <div className="flex items-center justify-center h-64 text-[var(--color-textSecondary)]">
          No hay datos disponibles
        </div>
      </div>
    )
  }

  // Color palette for different payment methods
  const colors = [
    'var(--color-primary)',
    'var(--color-info)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-danger)',
  ]

  // Get icon for payment method
  const getIcon = (method: string) => {
    if (method.toLowerCase().includes('card') || method.toLowerCase().includes('tarjeta')) {
      return <CreditCard size={20} />
    }
    return <Wallet size={20} />
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="card">
      <h3 className="card-header mb-6">{title}</h3>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          {/* SVG Donut */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.count / total) * 100
              const previousPercentage = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.count / total) * 100, 0)

              // Circle parameters
              const radius = 40
              const circumference = 2 * Math.PI * radius
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((previousPercentage / 100) * circumference)

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-80"
                />
              )
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-[var(--color-textPrimary)]">
              {total}
            </div>
            <div className="text-xs text-[var(--color-textSecondary)]">
              Total
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-textSecondary)]">
                  {getIcon(item.method)}
                </span>
                <span className="text-sm font-medium text-[var(--color-textPrimary)]">
                  {item.method}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-textSecondary)]">
                {item.count} pagos
              </span>
              <span
                className="text-sm font-semibold min-w-[48px] text-right"
                style={{ color: colors[index % colors.length] }}
              >
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total at bottom */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex justify-between items-center">
        <span className="text-sm text-[var(--color-textSecondary)]">
          Total de transacciones
        </span>
        <span className="text-lg font-bold text-[var(--color-textPrimary)]">
          {total}
        </span>
      </div>
    </div>
  )
}
