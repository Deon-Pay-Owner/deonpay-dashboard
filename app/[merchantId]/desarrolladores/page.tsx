import { Copy, Eye, EyeOff, Key, BookOpen, Code2 } from 'lucide-react'

export default async function DesarrolladoresPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return (
    <div className="container-dashboard py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Desarrolladores
        </h1>
        <p className="text-gray-600">
          Credenciales API, documentación y herramientas de integración
        </p>
      </div>

      {/* API Keys */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Credenciales API
          </h2>
        </div>

        <div className="space-y-4">
          {/* Publishable Key */}
          <div>
            <label className="label-field">Publishable Key (Pública)</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value="pk_test_xxxxxxxxxxxxxxxxxxxxxx"
                  className="input-field font-mono text-sm pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar"
                  >
                    <Copy size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Esta key es segura para usar en el frontend de tu aplicación
            </p>
          </div>

          {/* Secret Key */}
          <div>
            <label className="label-field">Secret Key (Privada)</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="password"
                  readOnly
                  value="sk_test_xxxxxxxxxxxxxxxxxxxxxx"
                  className="input-field font-mono text-sm pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Mostrar"
                  >
                    <Eye size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copiar"
                  >
                    <Copy size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Nunca expongas esta key en el frontend. Solo úsala en tu servidor.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Modo de prueba:</strong> Estas credenciales son de prueba.
            Las transacciones no procesarán dinero real. Activa el modo producción
            cuando estés listo para ir en vivo.
          </p>
        </div>
      </div>

      {/* Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Documentación
            </h2>
          </div>
          <div className="space-y-3">
            <a
              href="#"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-medium text-gray-900 text-sm mb-1">
                Guía de inicio rápido
              </p>
              <p className="text-xs text-gray-600">
                Integra DeonPay en 5 minutos
              </p>
            </a>
            <a
              href="#"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-medium text-gray-900 text-sm mb-1">
                Referencia de API
              </p>
              <p className="text-xs text-gray-600">
                Documentación completa de endpoints
              </p>
            </a>
            <a
              href="#"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="font-medium text-gray-900 text-sm mb-1">
                Webhooks
              </p>
              <p className="text-xs text-gray-600">
                Configura notificaciones en tiempo real
              </p>
            </a>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Ejemplos de código
            </h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900 text-sm mb-1">
                Node.js / Express
              </p>
              <p className="text-xs text-gray-600">
                Backend con JavaScript/TypeScript
              </p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900 text-sm mb-1">
                Python / Django
              </p>
              <p className="text-xs text-gray-600">
                Integración con Python
              </p>
            </button>
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900 text-sm mb-1">
                PHP / Laravel
              </p>
              <p className="text-xs text-gray-600">
                Ejemplo con PHP moderno
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="card bg-gray-900 text-gray-100">
        <h2 className="text-lg font-semibold mb-4">Ejemplo rápido</h2>
        <pre className="text-sm overflow-x-auto">
          <code>{`// Instalar el SDK
npm install @deonpay/sdk

// Crear un pago
import { DeonPay } from '@deonpay/sdk'

const deonpay = new DeonPay('sk_test_xxx')

const payment = await deonpay.payments.create({
  amount: 10000, // $100.00 MXN
  currency: 'mxn',
  customer: {
    email: 'cliente@ejemplo.com'
  },
  metadata: {
    order_id: '123'
  }
})

console.log(payment.id) // pmt_xxxxx`}</code>
        </pre>
      </div>
    </div>
  )
}
