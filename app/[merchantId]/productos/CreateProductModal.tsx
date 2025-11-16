'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CreateProductModalProps {
  merchantId: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProductModal({
  merchantId,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_amount: '',
    currency: 'MXN',
    type: 'one_time' as 'one_time' | 'recurring',
    recurring_interval: 'month',
    recurring_interval_count: '1',
    active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Convert amount to minor units (cents/centavos)
      const amountInCents = Math.round(parseFloat(formData.unit_amount) * 100)

      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        unit_amount: amountInCents,
        currency: formData.currency,
        type: formData.type,
        active: formData.active,
      }

      if (formData.type === 'recurring') {
        payload.recurring_interval = formData.recurring_interval
        payload.recurring_interval_count = parseInt(formData.recurring_interval_count)
      }

      // Get the merchant's API key from cookies
      const apiKey = document.cookie
        .split('; ')
        .find(row => row.startsWith('deonpay_api_key='))
        ?.split('=')[1]

      if (!apiKey) {
        throw new Error('No se encontró la API key. Por favor inicia sesión nuevamente.')
      }

      // Call the API to create the product
      const response = await fetch('https://api.deonpay.mx/api/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          merchant_id: merchantId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Error al crear el producto')
      }

      const result = await response.json()
      console.log('Product created:', result)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">Crear Producto</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-surfaceHover)] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              className="input-field w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Plan Pro Mensual"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
              Descripción
            </label>
            <textarea
              className="input-field w-full min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tu producto o servicio"
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Precio *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input-field w-full"
                value={formData.unit_amount}
                onChange={(e) => setFormData({ ...formData, unit_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Moneda
              </label>
              <select
                className="input-field w-full"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
              Tipo de producto
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'one_time'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
                onClick={() => setFormData({ ...formData, type: 'one_time' })}
              >
                <div className="font-semibold text-[var(--color-textPrimary)] mb-1">Pago único</div>
                <div className="text-xs text-[var(--color-textSecondary)]">
                  Cobra una sola vez
                </div>
              </button>

              <button
                type="button"
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'recurring'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                }`}
                onClick={() => setFormData({ ...formData, type: 'recurring' })}
              >
                <div className="font-semibold text-[var(--color-textPrimary)] mb-1">Suscripción</div>
                <div className="text-xs text-[var(--color-textSecondary)]">
                  Cobra recurrentemente
                </div>
              </button>
            </div>
          </div>

          {/* Recurring settings */}
          {formData.type === 'recurring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--color-background)] rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Intervalo
                </label>
                <select
                  className="input-field w-full"
                  value={formData.recurring_interval}
                  onChange={(e) => setFormData({ ...formData, recurring_interval: e.target.value })}
                >
                  <option value="day">Día</option>
                  <option value="week">Semana</option>
                  <option value="month">Mes</option>
                  <option value="year">Año</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field w-full"
                  value={formData.recurring_interval_count}
                  onChange={(e) => setFormData({ ...formData, recurring_interval_count: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 text-sm text-[var(--color-textSecondary)]">
                El cliente será cobrado cada{' '}
                {formData.recurring_interval_count !== '1' && formData.recurring_interval_count + ' '}
                {formData.recurring_interval === 'day' && (formData.recurring_interval_count === '1' ? 'día' : 'días')}
                {formData.recurring_interval === 'week' && (formData.recurring_interval_count === '1' ? 'semana' : 'semanas')}
                {formData.recurring_interval === 'month' && (formData.recurring_interval_count === '1' ? 'mes' : 'meses')}
                {formData.recurring_interval === 'year' && (formData.recurring_interval_count === '1' ? 'año' : 'años')}
              </div>
            </div>
          )}

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm font-medium text-[var(--color-textPrimary)] cursor-pointer">
              Activar producto inmediatamente
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[var(--color-border)] rounded-lg font-semibold text-[var(--color-textPrimary)] hover:bg-[var(--color-surfaceHover)] transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}