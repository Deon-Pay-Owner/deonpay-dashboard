import { createClient } from '@/lib/supabase'
import { Building2, User, Bell, Shield, CreditCard } from 'lucide-react'

export default async function CuentaPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Get merchant and user info
  const { data: { user } } = await supabase.auth.getUser()
  const { data: merchant } = await supabase
    .from('merchants')
    .select('name')
    .eq('id', merchantId)
    .single()

  return (
    <div className="container-dashboard py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configuración de cuenta
        </h1>
        <p className="text-gray-600">
          Gestiona la información de tu cuenta y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Información del negocio
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-field">Nombre del negocio</label>
                <input
                  type="text"
                  defaultValue={merchant?.name || ''}
                  className="input-field"
                  placeholder="Mi Empresa S.A. de C.V."
                />
              </div>

              <div>
                <label className="label-field">RFC</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ABC123456XYZ"
                />
              </div>

              <div>
                <label className="label-field">Dirección fiscal</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Calle, Número, Colonia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Ciudad</label>
                  <input type="text" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Código Postal</label>
                  <input type="text" className="input-field" />
                </div>
              </div>

              <button className="btn-primary">Guardar cambios</button>
            </div>
          </div>

          {/* Account Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <User size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Información de usuario
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-field">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="input-field bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contacta soporte para cambiar tu email
                </p>
              </div>

              <div>
                <label className="label-field">Nombre completo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="label-field">Teléfono</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+52 555 123 4567"
                />
              </div>

              <button className="btn-primary">Actualizar información</button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Transacciones
                  </p>
                  <p className="text-xs text-gray-600">
                    Recibe notificaciones de nuevos pagos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Reembolsos
                  </p>
                  <p className="text-xs text-gray-600">
                    Alertas cuando se solicitan reembolsos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Resumen semanal
                  </p>
                  <p className="text-xs text-gray-600">
                    Recibe un resumen de actividad cada semana
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Seguridad
              </h2>
            </div>

            <div className="space-y-3">
              <button className="w-full btn-secondary text-left text-sm">
                Cambiar contraseña
              </button>
              <button className="w-full btn-secondary text-left text-sm">
                Habilitar 2FA
              </button>
              <button className="w-full btn-secondary text-left text-sm">
                Sesiones activas
              </button>
            </div>
          </div>

          {/* Billing */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Facturación
              </h2>
            </div>

            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Plan actual</p>
                <p className="font-semibold text-gray-900">Gratuito</p>
              </div>

              <button className="w-full btn-primary text-sm">
                Ver planes
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              Zona de peligro
            </h2>

            <div className="space-y-3">
              <button className="w-full bg-white border border-red-300 text-red-700 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                Desactivar cuenta
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
