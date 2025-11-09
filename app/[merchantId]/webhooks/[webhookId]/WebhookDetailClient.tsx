'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Power,
  PowerOff,
  Edit,
  Trash2,
  Send
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface WebhookEvent {
  id: string
  webhook_id: string
  merchant_id: string
  event_type: string
  payload: any
  response_status: number | null
  response_body: string | null
  attempt_count: number
  delivered: boolean
  delivered_at: string | null
  next_retry_at: string | null
  created_at: string
}

interface WebhookDetailClientProps {
  merchantId: string
  webhook: Webhook
  initialEvents: WebhookEvent[]
}

export default function WebhookDetailClient({
  merchantId,
  webhook: initialWebhook,
  initialEvents,
}: WebhookDetailClientProps) {
  const router = useRouter()
  const [webhook, setWebhook] = useState<Webhook>(initialWebhook)
  const [events, setEvents] = useState<WebhookEvent[]>(initialEvents)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 5
  const maxEvents = 30

  // Calcular eventos a mostrar
  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = events.slice(0, maxEvents).slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(Math.min(events.length, maxEvents) / eventsPerPage)

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhook.secret)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !webhook.is_active,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWebhook(data.webhook)
      }
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este webhook? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push(`/${merchantId}/webhooks`)
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  const handleSendTest = async () => {
    setSendingTest(true)
    setTestResult(null)

    try {
      const response = await fetch(`/api/webhooks/${webhook.id}/test`, {
        method: 'POST',
      })

      const data = await response.json()

      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Evento enviado' : 'Error al enviar'),
      })

      // Recargar eventos después de 2 segundos
      setTimeout(async () => {
        const eventsResponse = await fetch(`/api/webhooks/${webhook.id}`)
        const eventsData = await eventsResponse.json()
        if (eventsData.events) {
          setEvents(eventsData.events)
          setCurrentPage(1) // Volver a la primera página
        }
      }, 2000)

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setTestResult(null)
      }, 5000)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error al enviar evento de prueba',
      })
      setTimeout(() => {
        setTestResult(null)
      }, 5000)
    } finally {
      setSendingTest(false)
    }
  }

  const getStatusIcon = (event: WebhookEvent) => {
    if (event.delivered) {
      return <CheckCircle size={18} className="text-green-600" />
    }
    if (event.response_status && event.response_status >= 400) {
      return <XCircle size={18} className="text-red-600" />
    }
    if (event.next_retry_at) {
      return <Clock size={18} className="text-yellow-600" />
    }
    return <AlertTriangle size={18} className="text-gray-400" />
  }

  const getStatusText = (event: WebhookEvent) => {
    if (event.delivered) return 'Entregado'
    if (event.response_status && event.response_status >= 400) return 'Falló'
    if (event.next_retry_at) return 'Reintentando'
    return 'Pendiente'
  }

  const getStatusColor = (event: WebhookEvent) => {
    if (event.delivered) return 'bg-green-100 text-green-700'
    if (event.response_status && event.response_status >= 400) return 'bg-red-100 text-red-700'
    if (event.next_retry_at) return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="container-dashboard pt-6 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <Link
          href={`/${merchantId}/webhooks`}
          className="inline-flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] mb-5 transition-colors"
        >
          <ArrowLeft size={18} />
          Volver a webhooks
        </Link>

        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
              Detalle del Webhook
            </h1>
            <p className="text-[var(--color-textSecondary)]">
              Información completa y eventos de entrega
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleSendTest}
              disabled={!webhook.is_active || sendingTest}
              className="btn-primary flex items-center gap-2 justify-center flex-1 sm:flex-initial"
              title={!webhook.is_active ? 'Activa el webhook para enviar pruebas' : 'Enviar evento de prueba'}
            >
              <Send size={18} />
              <span className="whitespace-nowrap">{sendingTest ? 'Enviando...' : 'Enviar Prueba'}</span>
            </button>
            <button
              onClick={handleToggleActive}
              className={`btn-ghost flex items-center gap-2 justify-center flex-1 sm:flex-initial ${
                webhook.is_active ? 'text-gray-600' : 'text-green-600'
              }`}
            >
              {webhook.is_active ? (
                <>
                  <PowerOff size={18} />
                  <span className="whitespace-nowrap">Desactivar</span>
                </>
              ) : (
                <>
                  <Power size={18} />
                  <span className="whitespace-nowrap">Activar</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="btn-ghost text-red-600 flex items-center gap-2 justify-center flex-1 sm:flex-initial"
            >
              <Trash2 size={18} />
              <span className="whitespace-nowrap">Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Result Message */}
      {testResult && (
        <div
          className={`card mb-6 ${
            testResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
            <p
              className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Webhook Info Card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-header">Información del Webhook</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              webhook.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {webhook.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="space-y-4">
          {/* URL */}
          <div>
            <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
              URL del endpoint
            </label>
            <p className="text-[var(--color-textPrimary)] font-mono text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] break-all overflow-x-auto">
              {webhook.url}
            </p>
          </div>

          {/* Description */}
          {webhook.description && (
            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Descripción
              </label>
              <p className="text-[var(--color-textPrimary)]">
                {webhook.description}
              </p>
            </div>
          )}

          {/* Events */}
          <div>
            <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-2">
              Eventos suscritos
            </label>
            <div className="flex flex-wrap gap-2">
              {webhook.events.map((event) => (
                <span
                  key={event}
                  className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium"
                >
                  {event}
                </span>
              ))}
            </div>
          </div>

          {/* Secret */}
          <div>
            <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
              Webhook Secret
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <p className="text-[var(--color-textPrimary)] font-mono text-sm bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] flex-1 break-all overflow-x-auto">
                {webhook.secret}
              </p>
              <button
                onClick={handleCopySecret}
                className="btn-ghost flex items-center gap-2 whitespace-nowrap justify-center sm:justify-start flex-shrink-0"
              >
                {copiedSecret ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              Usa este secret para verificar que los webhooks provienen de DeonPay
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Creado
              </label>
              <p className="text-[var(--color-textPrimary)] text-sm">
                {new Date(webhook.created_at).toLocaleString('es-MX')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Última actualización
              </label>
              <p className="text-[var(--color-textPrimary)] text-sm">
                {new Date(webhook.updated_at).toLocaleString('es-MX')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-header">Historial de eventos ({Math.min(events.length, maxEvents)})</h2>
          {events.length > maxEvents && (
            <span className="text-xs text-[var(--color-textSecondary)]">
              Mostrando los últimos {maxEvents} eventos
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center">
            <Clock size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
            <p className="text-[var(--color-textSecondary)] font-medium mb-2">
              No hay eventos registrados
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] opacity-70">
              Los eventos aparecerán aquí cuando se disparen
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {currentEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(event)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--color-textPrimary)]">
                          {event.event_type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            event
                          )}`}
                        >
                          {getStatusText(event)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-textSecondary)]">
                        {new Date(event.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {event.response_status && (
                      <span
                        className={`text-sm font-mono font-medium ${
                          event.response_status >= 200 && event.response_status < 300
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        HTTP {event.response_status}
                      </span>
                    )}
                    <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                      Intentos: {event.attempt_count}
                    </p>
                  </div>
                </div>

                {/* Payload */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Ver payload
                  </summary>
                  <pre className="mt-2 p-3 bg-[var(--color-background)] rounded text-xs overflow-x-auto border border-[var(--color-border)]">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </details>

                {/* Response */}
                {event.response_body && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">
                      Ver respuesta
                    </summary>
                    <pre className="mt-2 p-3 bg-[var(--color-background)] rounded text-xs overflow-x-auto border border-[var(--color-border)]">
                      {event.response_body}
                    </pre>
                  </details>
                )}

                {/* Next retry */}
                {event.next_retry_at && !event.delivered && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                    <Clock size={16} />
                    <span>
                      Próximo reintento: {new Date(event.next_retry_at).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}

                {/* Delivered */}
                {event.delivered && event.delivered_at && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                    <CheckCircle size={16} />
                    <span>
                      Entregado: {new Date(event.delivered_at).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
            ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="text-sm text-[var(--color-textSecondary)]">
                  Mostrando {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, Math.min(events.length, maxEvents))} de {Math.min(events.length, maxEvents)} eventos
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          currentPage === page
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'border border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 card bg-[var(--color-info)]/10 border-[var(--color-info)]/30">
        <h3 className="font-semibold text-[var(--color-info)] mb-2">
          Sobre la entrega de webhooks
        </h3>
        <p className="text-sm text-[var(--color-textSecondary)] mb-2">
          Los webhooks se envían automáticamente cuando ocurren los eventos configurados.
          Si la entrega falla, el sistema reintentará hasta 3 veces con intervalos exponenciales.
        </p>
        <ul className="text-sm text-[var(--color-textSecondary)] space-y-1">
          <li>• El endpoint debe responder con código HTTP 2xx para confirmar recepción</li>
          <li>• Verifica el secret en el header X-Webhook-Signature para validar autenticidad</li>
          <li>• Los eventos se mantienen en el historial por 30 días</li>
        </ul>
      </div>
    </div>
  )
}
