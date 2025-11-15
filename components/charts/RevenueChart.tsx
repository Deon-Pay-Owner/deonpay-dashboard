'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenueDataPoint {
  date: string
  amount: number
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  title?: string
}

export default function RevenueChart({ data, title = 'Ingresos en el tiempo' }: RevenueChartProps) {
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

  // Calculate max value for scaling
  const maxAmount = Math.max(...data.map((d) => d.amount))
  const minAmount = Math.min(...data.map((d) => d.amount))

  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  const avgFirst = firstHalf.reduce((sum, d) => sum + d.amount, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((sum, d) => sum + d.amount, 0) / secondHalf.length
  const trend = avgSecond > avgFirst ? 'up' : 'down'
  const trendPercentage = ((avgSecond - avgFirst) / avgFirst * 100).toFixed(1)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate bar heights (percentage of container)
  const getBarHeight = (amount: number) => {
    if (maxAmount === minAmount) return 50 // If all values are same, show at 50%
    return ((amount - minAmount) / (maxAmount - minAmount)) * 100
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="card-header">{title}</h3>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
        }`}>
          {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{trendPercentage}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-4">
        <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
          {data.map((point, index) => {
            const height = getBarHeight(point.amount)
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center">
                  <div
                    className="w-full bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-info)] rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        <div className="text-xs text-[var(--color-textSecondary)] mb-1">
                          {point.date}
                        </div>
                        <div className="text-sm font-semibold text-[var(--color-textPrimary)]">
                          {formatCurrency(point.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* X-axis labels - show only first, middle, and last */}
      <div className="flex justify-between text-xs text-[var(--color-textSecondary)] px-2">
        <span>{data[0].date}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)].date}</span>}
        <span>{data[data.length - 1].date}</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--color-border)]">
        <div>
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Promedio</div>
          <div className="text-sm font-semibold text-[var(--color-textPrimary)]">
            {formatCurrency(data.reduce((sum, d) => sum + d.amount, 0) / data.length)}
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Máximo</div>
          <div className="text-sm font-semibold text-[var(--color-textPrimary)]">
            {formatCurrency(maxAmount)}
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Mínimo</div>
          <div className="text-sm font-semibold text-[var(--color-textPrimary)]">
            {formatCurrency(minAmount)}
          </div>
        </div>
      </div>
    </div>
  )
}
