'use client'

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface SuccessRateData {
  date: string
  successful: number
  failed: number
  pending: number
}

interface SuccessRateChartProps {
  data: SuccessRateData[]
  title?: string
}

export default function SuccessRateChart({
  data,
  title = 'Tasa de éxito'
}: SuccessRateChartProps) {
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

  // Calculate totals
  const totals = data.reduce(
    (acc, day) => ({
      successful: acc.successful + day.successful,
      failed: acc.failed + day.failed,
      pending: acc.pending + day.pending,
    }),
    { successful: 0, failed: 0, pending: 0 }
  )

  const total = totals.successful + totals.failed + totals.pending
  const successRate = total > 0 ? (totals.successful / total) * 100 : 0

  // Calculate max for stacked bars
  const maxTotal = Math.max(...data.map(d => d.successful + d.failed + d.pending))

  return (
    <div className="card">
      <h3 className="card-header mb-6">{title}</h3>

      {/* Overall success rate */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-[var(--color-success)]/10 to-[var(--color-info)]/10 border border-[var(--color-success)]/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-textSecondary)]">
            Tasa de éxito general
          </span>
          <CheckCircle2 className="text-[var(--color-success)]" size={24} />
        </div>
        <div className="text-4xl font-bold text-[var(--color-success)] mb-2">
          {successRate.toFixed(1)}%
        </div>
        <div className="text-xs text-[var(--color-textSecondary)]">
          {totals.successful} exitosas de {total} transacciones
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="mb-6">
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((day, index) => {
            const dayTotal = day.successful + day.failed + day.pending
            const successHeight = dayTotal > 0 ? (day.successful / maxTotal) * 100 : 0
            const failedHeight = dayTotal > 0 ? (day.failed / maxTotal) * 100 : 0
            const pendingHeight = dayTotal > 0 ? (day.pending / maxTotal) * 100 : 0

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full flex flex-col items-center justify-end h-full relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                      <div className="text-xs text-[var(--color-textSecondary)] mb-2">
                        {day.date}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                          <span className="text-[var(--color-textSecondary)]">Exitosas:</span>
                          <span className="font-semibold text-[var(--color-textPrimary)]">{day.successful}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
                          <span className="text-[var(--color-textSecondary)]">Fallidas:</span>
                          <span className="font-semibold text-[var(--color-textPrimary)]">{day.failed}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                          <span className="text-[var(--color-textSecondary)]">Pendientes:</span>
                          <span className="font-semibold text-[var(--color-textPrimary)]">{day.pending}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stacked bars */}
                  <div className="w-full flex flex-col-reverse">
                    {pendingHeight > 0 && (
                      <div
                        className="w-full bg-[var(--color-warning)] transition-all duration-300"
                        style={{ height: `${pendingHeight}%` }}
                      />
                    )}
                    {failedHeight > 0 && (
                      <div
                        className="w-full bg-[var(--color-danger)] transition-all duration-300"
                        style={{ height: `${failedHeight}%` }}
                      />
                    )}
                    {successHeight > 0 && (
                      <div
                        className="w-full bg-[var(--color-success)] rounded-t-lg transition-all duration-300"
                        style={{ height: `${successHeight}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-[var(--color-textSecondary)] mb-6">
        <span>{data[0].date}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)].date}</span>}
        <span>{data[data.length - 1].date}</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)]">
        <div className="text-center p-3 rounded-lg bg-[var(--color-success)]/5">
          <CheckCircle2 className="mx-auto mb-2 text-[var(--color-success)]" size={20} />
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Exitosas</div>
          <div className="text-lg font-bold text-[var(--color-success)]">
            {totals.successful}
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-[var(--color-danger)]/5">
          <XCircle className="mx-auto mb-2 text-[var(--color-danger)]" size={20} />
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Fallidas</div>
          <div className="text-lg font-bold text-[var(--color-danger)]">
            {totals.failed}
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-[var(--color-warning)]/5">
          <AlertCircle className="mx-auto mb-2 text-[var(--color-warning)]" size={20} />
          <div className="text-xs text-[var(--color-textSecondary)] mb-1">Pendientes</div>
          <div className="text-lg font-bold text-[var(--color-warning)]">
            {totals.pending}
          </div>
        </div>
      </div>
    </div>
  )
}
