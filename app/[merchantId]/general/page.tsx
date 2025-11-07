import { createClient } from '@/lib/supabase'
import { TrendingUp, TrendingDown, DollarSign, Users, CreditCard, Activity } from 'lucide-react'

export default async function GeneralPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Get merchant info
  const { data: merchant } = await supabase
    .from('merchants')
    .select('name')
    .eq('id', merchantId)
    .single()

  const stats = [
    {
      name: 'Ventas del mes',
      value: '$0.00',
      change: '+0%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      name: 'Transacciones',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: CreditCard,
    },
    {
      name: 'Clientes activos',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Users,
    },
    {
      name: 'Tasa de éxito',
      value: '0%',
      change: '-0%',
      trend: 'down',
      icon: Activity,
    },
  ]

  return (
    <div className="container-dashboard py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a {merchant?.name || 'DeonPay'}
        </h1>
        <p className="text-gray-600">
          Resumen de tu actividad y métricas principales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <stat.icon className="text-primary-600" size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
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
              <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <h2 className="card-header">Transacciones recientes</h2>
          <div className="text-center py-12 text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No hay transacciones aún</p>
            <p className="text-sm mt-2">
              Las transacciones aparecerán aquí cuando proceses tu primer pago
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="card-header">Acciones rápidas</h2>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              Crear link de pago
            </button>
            <button className="w-full btn-secondary text-left">
              Ver documentación API
            </button>
            <button className="w-full btn-secondary text-left">
              Configurar webhook
            </button>
            <button className="w-full btn-secondary text-left">
              Invitar miembro del equipo
            </button>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 card bg-primary-50 border-primary-200">
        <h2 className="card-header text-primary-900">Primeros pasos</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Obtén tus credenciales API
              </h3>
              <p className="text-sm text-gray-600">
                Ve a la sección de Desarrolladores para obtener tus API keys
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Configura tu primer webhook
              </h3>
              <p className="text-sm text-gray-600">
                Recibe notificaciones de pagos en tiempo real
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Procesa tu primera transacción
              </h3>
              <p className="text-sm text-gray-600">
                Usa nuestra API o crea un link de pago para empezar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
