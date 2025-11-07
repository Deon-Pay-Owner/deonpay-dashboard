import { Plus, Webhook as WebhookIcon, CheckCircle, XCircle } from 'lucide-react'

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return (
    <div className="container-dashboard py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
          <p className="text-gray-600">
            Recibe notificaciones en tiempo real de eventos en tu cuenta
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo webhook
        </button>
      </div>

      {/* Info card */}
      <div className="card bg-blue-50 border-blue-200 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          ¿Qué son los webhooks?
        </h3>
        <p className="text-sm text-blue-800">
          Los webhooks te permiten recibir notificaciones HTTP automáticas
          cuando ocurren eventos específicos en tu cuenta, como pagos exitosos,
          reembolsos o cambios de estado. Configura una URL endpoint y recibirás
          los datos del evento en tiempo real.
        </p>
      </div>

      {/* Webhooks List */}
      <div className="card">
        <h2 className="card-header">Webhooks configurados</h2>

        {/* Empty state */}
        <div className="py-16 text-center">
          <WebhookIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">
            No hay webhooks configurados
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Configura tu primer webhook para recibir notificaciones en tiempo real
          </p>
          <button className="btn-primary mx-auto">Configurar webhook</button>
        </div>
      </div>

      {/* Events Reference */}
      <div className="mt-8 card">
        <h2 className="card-header">Eventos disponibles</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                payment.succeeded
              </p>
              <p className="text-xs text-gray-600">
                Se dispara cuando un pago se completa exitosamente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                payment.failed
              </p>
              <p className="text-xs text-gray-600">
                Se dispara cuando un pago falla o es rechazado
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                refund.created
              </p>
              <p className="text-xs text-gray-600">
                Se dispara cuando se crea un reembolso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                customer.created
              </p>
              <p className="text-xs text-gray-600">
                Se dispara cuando se registra un nuevo cliente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testing section */}
      <div className="mt-8 card bg-gray-50">
        <h2 className="card-header">Prueba de webhooks</h2>
        <p className="text-sm text-gray-600 mb-4">
          Usa estas herramientas para probar tus webhooks durante el desarrollo:
        </p>
        <div className="space-y-2">
          <a
            href="https://webhook.site"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            → webhook.site - Genera URLs de prueba temporales
          </a>
          <a
            href="https://ngrok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            → ngrok - Expone tu localhost para testing
          </a>
        </div>
      </div>
    </div>
  )
}
