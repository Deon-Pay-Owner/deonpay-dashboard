'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface CreateWebhookModalProps {
  merchantId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const AVAILABLE_EVENTS = [
  { value: 'payment.succeeded', label: 'Pago exitoso', description: 'Se dispara cuando un pago se completa' },
  { value: 'payment.failed', label: 'Pago fallido', description: 'Se dispara cuando un pago falla' },
  { value: 'refund.created', label: 'Reembolso creado', description: 'Se dispara cuando se crea un reembolso' },
  { value: 'customer.created', label: 'Cliente creado', description: 'Se dispara cuando se registra un cliente' },
]

export default function CreateWebhookModal({ merchantId, isOpen, onClose, onSuccess }: CreateWebhookModalProps) {
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (selectedEvents.length === 0) {
        setError('Debes seleccionar al menos un evento')
        setLoading(false)
        return
      }

      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          url,
          description,
          events: selectedEvents,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear webhook')
      }

      // Reset form
      setUrl('')
      setDescription('')
      setSelectedEvents([])
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear webhook')
    } finally {
      setLoading(false)
    }
  }

  const toggleEvent = (eventValue: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventValue)
        ? prev.filter(e => e !== eventValue)
        : [...prev, eventValue]
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-background)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">
            Crear Webhook
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* URL */}
          <div className="mb-4">
            <label htmlFor="url" className="label-field">
              URL del endpoint *
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              placeholder="https://tu-sitio.com/webhooks"
              required
              disabled={loading}
            />
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              La URL donde recibirás las notificaciones
            </p>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label htmlFor="description" className="label-field">
              Descripción (opcional)
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="Ej: Webhook para producción"
              disabled={loading}
            />
          </div>

          {/* Eventos */}
          <div className="mb-6">
            <label className="label-field mb-3 block">
              Eventos a suscribir *
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event.value}
                  className="flex items-start gap-3 p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface)]/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                      {event.label}
                    </p>
                    <p className="text-xs text-[var(--color-textSecondary)]">
                      {event.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
