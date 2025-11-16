'use client'

import { useState } from 'react'
import { X, Copy, Check, QrCode, Download, ExternalLink } from 'lucide-react'

interface Product {
  id: string
  name: string
  unit_amount: number
  currency: string
}

interface CreatePaymentLinkModalProps {
  merchantId: string
  product: Product
  onClose: () => void
  onSuccess: () => void
}

export default function CreatePaymentLinkModal({
  merchantId,
  product,
  onClose,
  onSuccess,
}: CreatePaymentLinkModalProps) {
  const [step, setStep] = useState<'config' | 'success'>('config')
  const [formData, setFormData] = useState({
    custom_url: '',
    after_completion_type: 'hosted_confirmation' as 'hosted_confirmation' | 'redirect',
    redirect_url: '',
    custom_message: '',
    phone_number_collection: false,
    billing_address_collection: 'auto' as 'auto' | 'required',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentLink, setPaymentLink] = useState<any>(null)
  const [copied, setCopied] = useState<'url' | 'embed' | null>(null)

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: any = {
        line_items: [
          {
            product_id: product.id,
            quantity: 1,
          },
        ],
        custom_url: formData.custom_url || undefined,
        phone_number_collection: formData.phone_number_collection,
        billing_address_collection: formData.billing_address_collection,
        after_completion: {
          type: formData.after_completion_type,
        },
      }

      if (formData.after_completion_type === 'redirect' && formData.redirect_url) {
        payload.after_completion.redirect = { url: formData.redirect_url }
      } else if (formData.custom_message) {
        payload.after_completion.hosted_confirmation = {
          custom_message: formData.custom_message,
        }
      }

      // Get the merchant's API key from the Next.js API route
      const apiKeyResponse = await fetch(`/api/merchant/${merchantId}/api-key`)

      if (!apiKeyResponse.ok) {
        const error = await apiKeyResponse.json().catch(() => ({}))
        throw new Error(error.error || 'No se pudo obtener la API key. Por favor verifica que tengas una API key activa.')
      }

      const { api_key: apiKey } = await apiKeyResponse.json()

      // Call the API to create the payment link
      const response = await fetch('https://api.deonpay.mx/api/v1/payment-links', {
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
        throw new Error(errorData.error?.message || 'Error al crear el payment link')
      }

      const link = await response.json()
      console.log('Payment link created:', link)

      setPaymentLink(link)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Error al crear el payment link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: 'url' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getEmbedCode = () => {
    if (!paymentLink) return ''

    return `<a href="${paymentLink.url}" class="deonpay-button">
  Comprar ${product.name}
</a>

<style>
.deonpay-button {
  display: inline-block;
  padding: 12px 24px;
  background: #6366f1;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.deonpay-button:hover {
  opacity: 0.9;
}
</style>`
  }

  const downloadQRCode = () => {
    if (!paymentLink) return

    const link = document.createElement('a')
    link.href = paymentLink.qr_code_url
    link.download = `qr-${product.name.toLowerCase().replace(/\s+/g, '-')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (step === 'success' && paymentLink) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">Payment Link Creado</h2>
              <p className="text-sm text-[var(--color-textSecondary)] mt-1">
                Tu link de pago está listo para compartir
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-surfaceHover)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Product Summary */}
            <div className="p-4 bg-[var(--color-background)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--color-textPrimary)]">{product.name}</h3>
                  <p className="text-sm text-[var(--color-textSecondary)] mt-1">Payment Link</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--color-textPrimary)]">
                    {formatPrice(product.unit_amount, product.currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Link URL */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                URL de pago
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  className="input-field flex-1"
                  value={paymentLink.url}
                />
                <button
                  onClick={() => copyToClipboard(paymentLink.url, 'url')}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {copied === 'url' ? <Check size={18} /> : <Copy size={18} />}
                  {copied === 'url' ? 'Copiado' : 'Copiar'}
                </button>
                <a
                  href={paymentLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[var(--color-surface)] text-[var(--color-textPrimary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={18} />
                  Abrir
                </a>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Código QR
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={paymentLink.qr_code_url}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-[var(--color-textSecondary)]">
                    Los clientes pueden escanear este código QR para acceder directamente al pago.
                  </p>
                  <button
                    onClick={downloadQRCode}
                    className="w-full px-4 py-2 bg-[var(--color-surface)] text-[var(--color-textPrimary)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Descargar QR
                  </button>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Código para embeber
              </label>
              <div className="relative">
                <pre className="bg-[var(--color-background)] p-4 rounded-lg overflow-x-auto text-xs font-mono text-[var(--color-textPrimary)] border border-[var(--color-border)]">
                  <code>{getEmbedCode()}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(getEmbedCode(), 'embed')}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-[var(--color-primary)] text-white text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  {copied === 'embed' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'embed' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-[var(--color-textSecondary)] mt-2">
                Copia y pega este código en tu sitio web para agregar un botón de pago
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onSuccess}
                className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-textPrimary)]">Crear Payment Link</h2>
            <p className="text-sm text-[var(--color-textSecondary)] mt-1">
              Para: {product.name} - {formatPrice(product.unit_amount, product.currency)}
            </p>
          </div>
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

          {/* Custom URL */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
              URL personalizada (opcional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-textSecondary)] whitespace-nowrap">
                pay.deonpay.mx/l/
              </span>
              <input
                type="text"
                className="input-field flex-1"
                value={formData.custom_url}
                onChange={(e) => setFormData({ ...formData, custom_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="mi-producto"
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              Solo letras minúsculas, números y guiones
            </p>
          </div>

          {/* After completion */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
              Después del pago
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-surfaceHover)] transition-colors">
                <input
                  type="radio"
                  name="after_completion"
                  checked={formData.after_completion_type === 'hosted_confirmation'}
                  onChange={() => setFormData({ ...formData, after_completion_type: 'hosted_confirmation' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-[var(--color-textPrimary)]">
                    Mostrar confirmación de DeonPay
                  </div>
                  <div className="text-sm text-[var(--color-textSecondary)] mt-1">
                    Página de confirmación alojada por DeonPay
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-surfaceHover)] transition-colors">
                <input
                  type="radio"
                  name="after_completion"
                  checked={formData.after_completion_type === 'redirect'}
                  onChange={() => setFormData({ ...formData, after_completion_type: 'redirect' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-[var(--color-textPrimary)]">
                    Redirigir a mi sitio
                  </div>
                  <div className="text-sm text-[var(--color-textSecondary)] mt-1">
                    Enviar al cliente a tu propia URL
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Redirect URL */}
          {formData.after_completion_type === 'redirect' && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                URL de redirección *
              </label>
              <input
                type="url"
                required
                className="input-field w-full"
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
                placeholder="https://tusitio.com/gracias"
              />
            </div>
          )}

          {/* Custom Message */}
          {formData.after_completion_type === 'hosted_confirmation' && (
            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Mensaje personalizado (opcional)
              </label>
              <textarea
                className="input-field w-full"
                value={formData.custom_message}
                onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                placeholder="¡Gracias por tu compra! Te enviaremos un correo con los detalles."
                rows={3}
              />
            </div>
          )}

          {/* Collection options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                checked={formData.phone_number_collection}
                onChange={(e) => setFormData({ ...formData, phone_number_collection: e.target.checked })}
              />
              <div>
                <div className="text-sm font-medium text-[var(--color-textPrimary)]">
                  Solicitar número de teléfono
                </div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                Dirección de facturación
              </label>
              <select
                className="input-field w-full"
                value={formData.billing_address_collection}
                onChange={(e) => setFormData({ ...formData, billing_address_collection: e.target.value as 'auto' | 'required' })}
              >
                <option value="auto">Automático (cuando sea necesario)</option>
                <option value="required">Siempre requerida</option>
              </select>
            </div>
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
              className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                'Creando...'
              ) : (
                <>
                  <QrCode size={18} />
                  Crear Payment Link
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}