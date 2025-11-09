'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Webhook as WebhookIcon, CheckCircle, XCircle, ExternalLink, Trash2, Power, PowerOff } from 'lucide-react'
import CreateWebhookModal from '@/components/CreateWebhookModal'

interface Webhook {
  id: string
  url: string
  description: string | null
  events: string[]
  is_active: boolean
  secret: string
  created_at: string
  updated_at: string
}

interface WebhooksClientProps {
  merchantId: string
  initialWebhooks: Webhook[]
}

export default function WebhooksClient({ merchantId, initialWebhooks }: WebhooksClientProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleWebhookCreated = async () => {
    // Recargar webhooks
    const response = await fetch(`/api/webhooks?merchantId=${merchantId}`)
    const data = await response.json()
    setWebhooks(data.webhooks || [])
  }

  const handleToggleActive = async (webhookId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      })

      if (response.ok) {
        setWebhooks(prev =>
          prev.map(wh =>
            wh.id === webhookId ? { ...wh, is_active: !currentStatus } : wh
          )
        )
      }
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  const handleDelete = async (webhookId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este webhook?')) {
      return
    }

    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWebhooks(prev => prev.filter(wh => wh.id !== webhookId))
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  return (
    <div className="container-dashboard pt-6 pb-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">Webhooks</h1>
          <p className="text-[var(--color-textSecondary)]">
            Recibe notificaciones en tiempo real de eventos en tu cuenta
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
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

        {webhooks.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center">
            <WebhookIcon size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
            <p className="text-[var(--color-textSecondary)] font-medium mb-2">
              No hay webhooks configurados
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] opacity-70 mb-4">
              Configura tu primer webhook para recibir notificaciones en tiempo real
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary mx-auto"
            >
              Configurar webhook
            </button>
          </div>
        ) : (
          /* Webhooks list */
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <Link
                        href={`/${merchantId}/webhooks/${webhook.id}`}
                        className="font-semibold text-[var(--color-textPrimary)] hover:text-[var(--color-primary)] flex items-center gap-2 break-all sm:break-normal"
                      >
                        <span className="break-all">{webhook.url}</span>
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </Link>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto whitespace-nowrap ${
                          webhook.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {webhook.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {webhook.description && (
                      <p className="text-sm text-[var(--color-textSecondary)] mb-2 break-words">
                        {webhook.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded text-xs font-medium"
                        >
                          {event}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-[var(--color-textSecondary)] mt-2">
                      Creado: {new Date(webhook.created_at).toLocaleString('es-MX')}
                    </p>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(webhook.id, webhook.is_active)}
                      className="p-2 hover:bg-[var(--color-background)] rounded-lg transition-colors"
                      title={webhook.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {webhook.is_active ? (
                        <PowerOff size={18} className="text-gray-500" />
                      ) : (
                        <Power size={18} className="text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Modal */}
      <CreateWebhookModal
        merchantId={merchantId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleWebhookCreated}
      />
    </div>
  )
}
