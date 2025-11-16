'use client'

import { useState, useEffect } from 'react'
import { Lock, ShoppingCart, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CheckoutSession {
  id: string
  mode: string
  currency: string
  amount_total: number
  amount_subtotal: number
  amount_tax: number
  line_items: Array<{
    id: string
    name: string
    description?: string
    images: string[]
    quantity: number
    amount_total: number
    amount_subtotal: number
  }>
  merchant: {
    id: string
    name: string
    logo_url?: string
    support_email?: string
    support_phone?: string
  }
  expires_at: string
  billing_address_collection?: string
  shipping_address_collection?: any
  custom_fields?: any[]
  consent_collection?: any
  locale: string
}

export default function CheckoutClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchSession()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setLoading(true)
      // In production, this would call the API endpoint
      // GET /api/v1/checkout/sessions/by-url/:url_key

      // For now, simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock session data
      const mockSession: CheckoutSession = {
        id: sessionId,
        mode: 'payment',
        currency: 'MXN',
        amount_total: 99900,
        amount_subtotal: 99900,
        amount_tax: 0,
        line_items: [
          {
            id: '1',
            name: 'Plan Pro Mensual',
            description: 'Acceso completo a todas las funcionalidades',
            images: [],
            quantity: 1,
            amount_total: 99900,
            amount_subtotal: 99900,
          },
        ],
        merchant: {
          id: 'merchant_1',
          name: 'DeonPay Demo',
          logo_url: undefined,
          support_email: 'support@deonpay.mx',
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locale: 'es',
      }

      setSession(mockSession)
    } catch (err: any) {
      setError(err.message || 'Error al cargar la sesión de checkout')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      // Step 1: Create payment intent
      // POST /api/v1/payment_intents
      // {
      //   amount: session.amount_total,
      //   currency: session.currency,
      //   metadata: { checkout_session_id: sessionId }
      // }

      // Step 2: Get Elements token
      // POST /api/v1/elements/tokens
      // { payment_intent_id: paymentIntent.id }

      // Step 3: Initialize DeonPay Elements
      // const elements = DeonPay.elements(token)
      // const cardElement = elements.create('card')
      // cardElement.mount('#card-element')

      // Step 4: Confirm payment
      // POST /api/v1/payment_intents/:id/confirm
      // { payment_method: cardData }

      // Step 5: Complete checkout session
      // POST /api/v1/checkout/sessions/:id/complete
      // { payment_intent_id, customer_email, customer_name }

      // For now, simulate the flow
      await new Promise(resolve => setTimeout(resolve, 2000))

      setPaymentComplete(true)
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando checkout...</p>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (paymentComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Pago Exitoso
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Tu pago ha sido procesado correctamente. Te hemos enviado un correo de confirmación a{' '}
            <span className="font-medium">{email}</span>.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total pagado</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {session && formatPrice(session.amount_total, session.currency)}
              </span>
            </div>
          </div>
          {session?.merchant.support_email && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ¿Necesitas ayuda? Contáctanos en{' '}
              <a
                href={`mailto:${session.merchant.support_email}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {session.merchant.support_email}
              </a>
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {session.merchant.logo_url ? (
            <img
              src={session.merchant.logo_url}
              alt={session.merchant.name}
              className="h-12 mx-auto mb-4"
            />
          ) : (
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {session.merchant.name}
            </h1>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Payment Form */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Información de pago
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>

                {/* Phone (if required) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 123 456 7890"
                  />
                </div>

                {/* Card Element Placeholder */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Tarjeta de crédito o débito *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      DeonPay Elements se montaría aquí
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      Integración con componente de tarjeta seguro
                    </p>
                  </div>
                </div>

                {/* Security notice */}
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Lock size={16} />
                  <span>Pago seguro y encriptado</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar {formatPrice(session.amount_total, session.currency)}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Powered by */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Powered by{' '}
                <a
                  href="https://deonpay.mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  DeonPay
                </a>
              </p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 sticky top-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <ShoppingCart size={24} />
                Resumen de compra
              </h2>

              {/* Line Items */}
              <div className="space-y-4 mb-6">
                {session.line_items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Image placeholder */}
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-white/80" />
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Cantidad: {item.quantity}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatPrice(item.amount_total, session.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(session.amount_subtotal, session.currency)}</span>
                </div>

                {session.amount_tax > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Impuestos</span>
                    <span>{formatPrice(session.amount_tax, session.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span>Total</span>
                  <span>{formatPrice(session.amount_total, session.currency)}</span>
                </div>
              </div>

              {/* Merchant info */}
              {session.merchant.support_email && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ¿Tienes preguntas? Contáctanos en{' '}
                    <a
                      href={`mailto:${session.merchant.support_email}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      {session.merchant.support_email}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}