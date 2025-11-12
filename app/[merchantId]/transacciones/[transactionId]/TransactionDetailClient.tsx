'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard, User, MapPin, Shield, Server, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

type Charge = {
  id: string
  status: string
  amount_authorized?: number
  amount_captured?: number
  amount_refunded?: number
  acquirer_reference?: string | null
  authorization_code?: string | null
  network?: string | null
  acquirer_name?: string | null
  processor_response?: {
    code?: string
    message?: string
    avs_result?: string | null
    cvc_check?: string | null
    raw_response?: any
  } | null
  created_at: string
}

type PaymentIntent = {
  id: string
  created_at: string
  amount: number
  currency: string
  status: string
  description?: string | null
  payment_method?: {
    type?: string
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
  } | null
  customer?: {
    name?: string
    email?: string
  } | null
  metadata?: Record<string, any> | null
  charges?: Charge[]
}

export default function TransactionDetailClient({
  paymentIntent,
  merchantId,
}: {
  paymentIntent: PaymentIntent
  merchantId: string
}) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      succeeded: {
        label: 'Exitoso',
        className: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
        icon: CheckCircle2,
      },
      processing: {
        label: 'Procesando',
        className: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
        icon: AlertCircle,
      },
      requires_payment_method: {
        label: 'Pendiente',
        className: 'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]',
        icon: AlertCircle,
      },
      failed: {
        label: 'Fallido',
        className: 'bg-[var(--color-error)]/20 text-[var(--color-error)]',
        icon: XCircle,
      },
      canceled: {
        label: 'Cancelado',
        className: 'bg-[var(--color-textSecondary)]/20 text-[var(--color-textSecondary)]',
        icon: XCircle,
      },
    }

    const config = statusConfig[status] || statusConfig['requires_payment_method']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.className}`}>
        <Icon size={16} />
        {config.label}
      </span>
    )
  }

  const charge = paymentIntent.charges?.[0]

  return (
    <div className="container-dashboard py-8">
      {/* Back Button */}
      <Link
        href={`/${merchantId}/transacciones`}
        className="inline-flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a transacciones
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
            Detalle de Transacción
          </h1>
          <p className="text-[var(--color-textSecondary)] font-mono text-sm">
            {paymentIntent.id}
          </p>
        </div>
        {getStatusBadge(paymentIntent.status)}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info Card */}
          <div className="card">
            <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-[var(--color-primary)]" />
              Información del Pago
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-textSecondary)] mb-1">Monto</p>
                <p className="text-2xl font-bold text-[var(--color-textPrimary)]">
                  {formatCurrency(paymentIntent.amount, paymentIntent.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-textSecondary)] mb-1">Fecha</p>
                <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                  {formatDate(paymentIntent.created_at)}
                </p>
              </div>
              {paymentIntent.description && (
                <div className="col-span-2">
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Descripción</p>
                  <p className="text-sm text-[var(--color-textPrimary)]">
                    {paymentIntent.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          {paymentIntent.payment_method && (
            <div className="card">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-[var(--color-primary)]" />
                Método de Pago
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Tipo</p>
                  <p className="text-sm font-medium text-[var(--color-textPrimary)] capitalize">
                    {paymentIntent.payment_method.type || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Marca</p>
                  <p className="text-sm font-medium text-[var(--color-textPrimary)] capitalize">
                    {paymentIntent.payment_method.brand || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Últimos 4 dígitos</p>
                  <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                    •••• {paymentIntent.payment_method.last4 || '****'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Vencimiento</p>
                  <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                    {paymentIntent.payment_method.exp_month?.toString().padStart(2, '0') || 'XX'}/
                    {paymentIntent.payment_method.exp_year || 'XXXX'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info Card */}
          {paymentIntent.customer && (
            <div className="card">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <User size={20} className="text-[var(--color-primary)]" />
                Cliente
              </h2>
              <div className="space-y-3">
                {paymentIntent.customer.name && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Nombre</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                      {paymentIntent.customer.name}
                    </p>
                  </div>
                )}
                {paymentIntent.customer.email && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Email</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                      {paymentIntent.customer.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processor Response Card */}
          {charge?.processor_response && (
            <div className="card">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <Server size={20} className="text-[var(--color-primary)]" />
                Respuesta del Procesador
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Código</p>
                  <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                    {charge.processor_response.code || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Mensaje</p>
                  <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                    {charge.processor_response.message || 'N/A'}
                  </p>
                </div>
                {charge.processor_response.avs_result && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">AVS (Verificación de dirección)</p>
                    <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                      {charge.processor_response.avs_result}
                    </p>
                  </div>
                )}
                {charge.processor_response.cvc_check && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">CVC Check</p>
                    <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                      {charge.processor_response.cvc_check}
                    </p>
                  </div>
                )}
              </div>

              {/* Raw Response (if available) */}
              {charge.processor_response.raw_response && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-textSecondary)] mb-2">Respuesta completa:</p>
                  <pre className="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto text-xs">
                    <code className="text-gray-300">
                      {JSON.stringify(charge.processor_response.raw_response, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Metadata Card */}
          {paymentIntent.metadata && Object.keys(paymentIntent.metadata).length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-[var(--color-textPrimary)] mb-4">
                Metadata
              </h2>
              <div className="space-y-2">
                {Object.entries(paymentIntent.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                    <span className="text-sm text-[var(--color-textSecondary)]">{key}</span>
                    <span className="text-sm font-medium text-[var(--color-textPrimary)]">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Charge Details & Risk */}
        <div className="space-y-6">
          {/* Charge Summary Card */}
          {charge && (
            <div className="card">
              <h2 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4">
                Resumen del Cargo
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">ID del Cargo</p>
                  <p className="text-xs font-mono text-[var(--color-textPrimary)] break-all">
                    {charge.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)] mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    charge.status === 'captured' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                    charge.status === 'authorized' ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' :
                    'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                  }`}>
                    {charge.status === 'captured' ? 'Capturado' :
                     charge.status === 'authorized' ? 'Autorizado' :
                     charge.status === 'failed' ? 'Fallido' : charge.status}
                  </span>
                </div>
                {charge.amount_authorized && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Monto Autorizado</p>
                    <p className="text-sm font-semibold text-[var(--color-textPrimary)]">
                      {formatCurrency(charge.amount_authorized, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.amount_captured !== undefined && charge.amount_captured > 0 && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Monto Capturado</p>
                    <p className="text-sm font-semibold text-[var(--color-success)]">
                      {formatCurrency(charge.amount_captured, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.amount_refunded !== undefined && charge.amount_refunded > 0 && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Monto Reembolsado</p>
                    <p className="text-sm font-semibold text-[var(--color-error)]">
                      {formatCurrency(charge.amount_refunded, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.acquirer_reference && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Referencia Adquirente</p>
                    <p className="text-xs font-mono text-[var(--color-textPrimary)]">
                      {charge.acquirer_reference}
                    </p>
                  </div>
                )}
                {charge.authorization_code && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Código de Autorización</p>
                    <p className="text-xs font-mono text-[var(--color-textPrimary)]">
                      {charge.authorization_code}
                    </p>
                  </div>
                )}
                {charge.network && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Red</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)] capitalize">
                      {charge.network}
                    </p>
                  </div>
                )}
                {charge.acquirer_name && (
                  <div>
                    <p className="text-sm text-[var(--color-textSecondary)] mb-1">Procesador</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                      {charge.acquirer_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risk Analysis Card */}
          {charge?.processor_response && (
            <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <h2 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-400" />
                Análisis de Riesgo
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-[var(--color-textSecondary)]">Verificación CVV</span>
                  <span className={`text-sm font-semibold ${
                    charge.processor_response.cvc_check === 'pass' ? 'text-green-400' :
                    charge.processor_response.cvc_check === 'fail' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {charge.processor_response.cvc_check === 'pass' ? '✓ Aprobado' :
                     charge.processor_response.cvc_check === 'fail' ? '✗ Rechazado' :
                     charge.processor_response.cvc_check || '— Sin verificar'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-sm text-[var(--color-textSecondary)]">Verificación AVS</span>
                  <span className="text-sm font-semibold text-yellow-400">
                    {charge.processor_response.avs_result || '— Sin verificar'}
                  </span>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-blue-400">
                    Los datos de riesgo son provistos por el procesador de pagos y ayudan a identificar transacciones potencialmente fraudulentas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
