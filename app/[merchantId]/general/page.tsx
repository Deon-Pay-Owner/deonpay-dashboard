import { createClient } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity } from 'lucide-react'
import RecentTransactions from './RecentTransactions'

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

  // Get ALL transactions to calculate stats (not just current month)
  const { data: allTransactions, error: txnError } = await supabase
    .from('payment_intents')
    .select('amount, currency, status, customer, created_at')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })

  // Debug logging
  console.log('General Page Debug:', {
    merchantId,
    transactionCount: allTransactions?.length || 0,
    error: txnError,
    firstTransaction: allTransactions?.[0]
  })

  // Filter transactions by date range
  const currentMonthTxns = allTransactions?.filter(t => {
    const txnDate = new Date(t.created_at)
    return txnDate >= startOfMonth
  }) || []

  const lastMonthTxns = allTransactions?.filter(t => {
    const txnDate = new Date(t.created_at)
    return txnDate >= startOfLastMonth && txnDate <= endOfLastMonth
  }) || []

  // Calculate stats - use ALL TIME data if current month has no data
  const currentPeriodTxns = currentMonthTxns.length > 0 ? currentMonthTxns : allTransactions || []
  const isCurrentMonth = currentMonthTxns.length > 0

  const currentRevenue = currentPeriodTxns.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0)
  const lastMonthRevenue = lastMonthTxns.filter(t => t.status === 'succeeded').reduce((sum, t) => sum + t.amount, 0)
  const revenueChange = lastMonthRevenue > 0 ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0

  const currentCount = currentPeriodTxns.length
  const lastMonthCount = lastMonthTxns.length
  const countChange = lastMonthCount > 0 ? ((currentCount - lastMonthCount) / lastMonthCount * 100) : 0

  const uniqueCustomers = new Set(currentPeriodTxns.filter(t => t.customer).map(t => JSON.stringify(t.customer))).size
  const lastMonthUniqueCustomers = new Set(lastMonthTxns.filter(t => t.customer).map(t => JSON.stringify(t.customer))).size
  const customersChange = lastMonthUniqueCustomers > 0 ? ((uniqueCustomers - lastMonthUniqueCustomers) / lastMonthUniqueCustomers * 100) : 0

  const successRate = currentCount > 0 ? currentPeriodTxns.filter(t => t.status === 'succeeded').length / currentCount * 100 : 0
  const lastMonthSuccessRate = lastMonthCount > 0 ? lastMonthTxns.filter(t => t.status === 'succeeded').length / lastMonthCount * 100 : 0
  const successRateChange = successRate - lastMonthSuccessRate

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount / 100)
  }

  const stats = [
    {
      name: isCurrentMonth ? 'Ventas del mes' : 'Ventas totales',
      value: formatCurrency(currentRevenue),
      change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
      trend: revenueChange >= 0 ? 'up' : 'down',
      icon: DollarSign,
    },
    {
      name: isCurrentMonth ? 'Transacciones del mes' : 'Total transacciones',
      value: currentCount.toString(),
      change: `${countChange >= 0 ? '+' : ''}${countChange.toFixed(1)}%`,
      trend: countChange >= 0 ? 'up' : 'down',
      icon: CreditCard,
    },
    {
      name: isCurrentMonth ? 'Clientes del mes' : 'Total clientes',
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

  // Get recent transactions for the list - get more than 5 to enable pagination
  const { data: recentTransactions } = await supabase
    .from('payment_intents')
    .select('id, created_at, amount, currency, status, customer')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(20) // Get up to 20 transactions for pagination

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
        {/* Debug info */}
        {!allTransactions || allTransactions.length === 0 ? (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600">
              ⚠️ No se encontraron transacciones para este merchant. MerchantID: {merchantId}
            </p>
            {txnError && (
              <p className="text-xs text-red-600 mt-1">
                Error: {txnError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-600">
              ✓ {allTransactions.length} transacciones encontradas | Mostrando: {isCurrentMonth ? 'Datos del mes actual' : 'Datos históricos completos'}
            </p>
          </div>
        )}
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
            <RecentTransactions
              transactions={recentTransactions}
              merchantId={merchantId}
            />
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
