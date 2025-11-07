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
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">Webhooks</h1>
          <p className="text-[var(--color-textSecondary)]">
            Recibe notificaciones en tiempo real de eventos en tu cuenta
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo Webhook
        </button>
      </div>

      {/* Info card */}
      <div className="card bg-[var(--color-info)]/10 border-[var(--color-info)]/30 mb-6">
        <h3 className="font-semibold text-[var(--color-info)] mb-2">
          ¿Qué son los webhooks?
        </h3>
        <p className="text-sm text-[var(--color-textSecondary)]">
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
          <WebhookIcon size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
          <p className="text-[var(--color-textSecondary)] font-medium mb-2">
            No hay webhooks configurados
          </p>
          <p className="text-sm text-[var(--color-textSecondary)] opacity-70 mb-4">
            Configura tu primer webhook para recibir notificaciones en tiempo real
          </p>
          <button className="btn-primary mx-auto">Configurar webhook</button>
        </div>
      </div>

      {/* Events Reference */}
      <div className="mt-8 card">
        <h2 className="card-header">Eventos disponibles</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[var(--color-success)]/5 rounded-lg border border-[var(--color-success)]/20">
            <CheckCircle size={20} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-textPrimary)] text-sm">
                payment.succeeded
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Se dispara cuando un pago se completa exitosamente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--color-danger)]/5 rounded-lg border border-[var(--color-danger)]/20">
            <XCircle size={20} className="text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-textPrimary)] text-sm">
                payment.failed
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Se dispara cuando un pago falla o es rechazado
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--color-info)]/5 rounded-lg border border-[var(--color-info)]/20">
            <CheckCircle size={20} className="text-[var(--color-info)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-textPrimary)] text-sm">
                refund.created
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Se dispara cuando se crea un reembolso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--color-primary)]/5 rounded-lg border border-[var(--color-primary)]/20">
            <CheckCircle size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-textPrimary)] text-sm">
                customer.created
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Se dispara cuando se registra un nuevo cliente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testing section */}
      <div className="mt-8 card bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
        <h2 className="card-header">Prueba de webhooks</h2>
        <p className="text-sm text-[var(--color-textSecondary)] mb-4">
          Usa estas herramientas para probar tus webhooks durante el desarrollo:
        </p>
        <div className="space-y-2">
          <a
            href="https://webhook.site"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[var(--color-primary)] hover:underline text-sm font-medium"
          >
            → webhook.site - Genera URLs de prueba temporales
          </a>
          <a
            href="https://ngrok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[var(--color-primary)] hover:underline text-sm font-medium"
          >
            → ngrok - Expone tu localhost para testing
          </a>
        </div>
      </div>
    </div>
  )
}
