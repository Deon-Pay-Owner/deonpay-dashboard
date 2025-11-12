import { createClient } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function GeneralPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get merchant info
  const { data: merchant } = await supabase
    .from('merchants')
    .select('name')
    .eq('id', merchantId)
    .single()

  // Get current month date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get current month transactions
  const { data: currentMonthTxns } = await supabase
    .from('payment_intents')
    .select('amount, currency, status, customer')
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false })

  // Get last month transactions for comparison
  const { data: lastMonthTxns } = await supabase
    .from('payment_intents')
    .select('amount, currency, status, customer')
    .eq('merchant_id', merchantId)
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString())

  // Calculate stats
  const currentMonthRevenue = currentMonthTxns?.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0) || 0
  const lastMonthRevenue = lastMonthTxns?.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0) || 0
  const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0

  const currentMonthCount = currentMonthTxns?.length || 0
  const lastMonthCount = lastMonthTxns?.length || 0
  const countChange = lastMonthCount > 0 ? ((currentMonthCount - lastMonthCount) / lastMonthCount * 100) : 0

  const uniqueCustomers = new Set(currentMonthTxns?.filter(t => t.customer).map(t => JSON.stringify(t.customer))).size
  const lastMonthUniqueCustomers = new Set(lastMonthTxns?.filter(t => t.customer).map(t => JSON.stringify(t.customer))).size
  const customersChange = lastMonthUniqueCustomers > 0 ? ((uniqueCustomers - lastMonthUniqueCustomers) / lastMonthUniqueCustomers * 100) : 0

  const successRate = currentMonthCount > 0 ? (currentMonthTxns?.filter(t => t.status === 'succeeded').length || 0) / currentMonthCount * 100 : 0
  const lastMonthSuccessRate = lastMonthCount > 0 ? (lastMonthTxns?.filter(t => t.status === 'succeeded').length || 0) / lastMonthCount * 100 : 0
  const successRateChange = successRate - lastMonthSuccessRate

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount / 100)
  }

  const stats = [
    {
      name: 'Ventas del mes',
      value: formatCurrency(currentMonthRevenue),
      change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      name: 'Transacciones',
      value: currentMonthCount.toString(),
      change: `${countChange >= 0 ? '+' : ''}${countChange.toFixed(1)}%`,
      trend: countChange >= 0 ? 'up' : 'down',
      icon: CreditCard,
    },
    {
      name: 'Clientes activos',
      value: uniqueCustomers.toString(),
      change: `${customersChange >= 0 ? '+' : ''}${customersChange.toFixed(1)}%`,
      trend: customersChange >= 0 ? 'up' : 'down',
      icon: Users,
    },
    {
      name: 'Tasa de éxito',
      value: `${successRate.toFixed(1)}%`,
      change: `${successRateChange >= 0 ? '+' : ''}${successRateChange.toFixed(1)}%`,
      trend: successRateChange >= 0 ? 'up' : 'down',
      icon: Activity,
    },
  ]

  // Get recent transactions for the list
  const { data: recentTransactions } = await supabase
    .from('payment_intents')
    .select('id, created_at, amount, currency, status, customer')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(5)

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
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
          Bienvenido a {merchant?.name || 'DeonPay'}
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Resumen de tu actividad y métricas principales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <stat.icon className="text-[var(--color-primary)]" size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                }`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--color-textSecondary)] mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="card-header">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="btn-primary text-left">
            Crear link de pago
          </button>
          <button className="btn-secondary text-left">
            Ver documentación API
          </button>
          <button className="btn-secondary text-left">
            Configurar webhook
          </button>
          <button className="btn-secondary text-left">
            Invitar miembro del equipo
          </button>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <h2 className="card-header">Transacciones recientes</h2>
          {!recentTransactions || recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-textSecondary)]">
              <CreditCard size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
              <p>No hay transacciones aún</p>
              <p className="text-sm mt-2">
                Las transacciones aparecerán aquí cuando proceses tu primer pago
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
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
                        {formatCurrency(txn.amount)}
                      </p>
                      {getStatusBadge(txn.status)}
                    </div>
                  </div>
                  {txn.customer && (
                    <div className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
                      <Users size={12} />
                      <span className="truncate">
                        {typeof txn.customer === 'object' && txn.customer !== null
                          ? (txn.customer as any).email || (txn.customer as any).name || 'Cliente'
                          : 'Cliente'}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
              <Link
                href={`/${merchantId}/transacciones`}
                className="block text-center py-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
              >
                Ver todas las transacciones →
              </Link>
            </div>
          )}
        </div>

        {/* Getting Started Guide */}
        <div className="card bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
          <h2 className="card-header text-[var(--color-primary)]">Primeros pasos</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-1">
                  Obtén tus credenciales API
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Ve a la sección de Desarrolladores para obtener tus API keys
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-1">
                  Configura tu primer webhook
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Recibe notificaciones de pagos en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-1">
                  Procesa tu primera transacción
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  Usa nuestra API o crea un link de pago para empezar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
