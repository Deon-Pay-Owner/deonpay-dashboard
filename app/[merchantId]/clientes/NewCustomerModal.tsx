'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, MapPin } from 'lucide-react'

interface NewCustomerModalProps {
  merchantId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewCustomerModal({
  merchantId,
  isOpen,
  onClose,
  onSuccess,
}: NewCustomerModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')

  // Address state
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('MX')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('El email es requerido')
      return
    }

    setLoading(true)

    try {
      const billingAddress = {
        line1: addressLine1 || undefined,
        line2: addressLine2 || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postalCode || undefined,
        country: country || undefined,
      }

      const response = await fetch(`/api/merchant/${merchantId}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined,
          description: description || undefined,
          billing_address: Object.values(billingAddress).some(v => v) ? billingAddress : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear cliente')
      }

      // Reset form
      setEmail('')
      setName('')
      setPhone('')
      setDescription('')
      setAddressLine1('')
      setAddressLine2('')
      setCity('')
      setState('')
      setPostalCode('')
      setCountry('MX')

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al crear cliente')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-border)]">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">Nuevo Cliente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-background)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-textSecondary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <User size={18} />
              Información Básica
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  <Mail size={14} className="inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="input-field w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  <Phone size={14} className="inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="input-field w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 123 456 7890"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Descripción
                </label>
                <textarea
                  className="input-field w-full"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notas sobre el cliente..."
                />
              </div>
            </div>
          </div>

          {/* Billing Address (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <MapPin size={18} />
              Dirección de Facturación (Opcional)
            </h3>

            <div className="space-y-4">
              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Calle y número
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Av. Revolución 123"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                  Apartamento, suite, etc.
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Depto. 4B"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ciudad de México"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CDMX"
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                    Código postal
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="01234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                    País
                  </label>
                  <select
                    className="input-field w-full"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="CA">Canadá</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--color-textSecondary)] hover:bg-[var(--color-background)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <User size={18} />
                  Crear Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
