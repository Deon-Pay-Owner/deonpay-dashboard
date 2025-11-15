import { createClient } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity } from 'lucide-react'
import RecentTransactions from './RecentTransactions'
import RevenueChart from '@/components/charts/RevenueChart'
import PaymentMethodsChart from '@/components/charts/PaymentMethodsChart'
import SuccessRateChart from '@/components/charts/SuccessRateChart'

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

  // Get ALL transactions to calculate stats
  const { data: allTransactions, error: txnError, count: totalCount } = await supabase
    .from('payment_intents')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })

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

  // Prepare chart data - Revenue over last 30 days
  const revenueChartData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayTransactions = allTransactions?.filter(t => {
      const txnDate = new Date(t.created_at)
      return txnDate >= dayStart && txnDate <= dayEnd && t.status === 'succeeded'
    }) || []

    const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0) / 100

    revenueChartData.push({
      date: `${dayStart.getDate()}/${dayStart.getMonth() + 1}`,
      amount,
    })
  }

  // Prepare payment methods data
  const paymentMethodsMap = new Map<string, number>()
  currentPeriodTxns.forEach(t => {
    if (t.payment_method?.card?.brand) {
      const brand = t.payment_method.card.brand.charAt(0).toUpperCase() + t.payment_method.card.brand.slice(1)
      paymentMethodsMap.set(brand, (paymentMethodsMap.get(brand) || 0) + 1)
    } else {
      paymentMethodsMap.set('Tarjeta', (paymentMethodsMap.get('Tarjeta') || 0) + 1)
    }
  })

  const paymentMethodsData = Array.from(paymentMethodsMap.entries()).map(([method, count]) => ({
    method,
    count,
    percentage: (count / currentPeriodTxns.length) * 100,
  }))

  // Prepare success rate data over last 14 days
  const successRateChartData = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayTransactions = allTransactions?.filter(t => {
      const txnDate = new Date(t.created_at)
      return txnDate >= dayStart && txnDate <= dayEnd
    }) || []

    successRateChartData.push({
      date: `${dayStart.getDate()}/${dayStart.getMonth() + 1}`,
      successful: dayTransactions.filter(t => t.status === 'succeeded').length,
      failed: dayTransactions.filter(t => t.status === 'failed' || t.status === 'canceled').length,
      pending: dayTransactions.filter(t => t.status === 'pending' || t.status === 'requires_action').length,
    })
  }

  // Get recent transactions for the list
  const { data: recentTransactions } = await supabase
    .from('payment_intents')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(20)

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

      {/* Analytics Charts - 2 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <RevenueChart data={revenueChartData} title="Ingresos últimos 30 días" />

        {/* Success Rate */}
        <SuccessRateChart data={successRateChartData} title="Tasa de éxito últimos 14 días" />
      </div>

      {/* Second row - Payment Methods and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <PaymentMethodsChart data={paymentMethodsData} />

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
      </div>
    </div>
  )
}
