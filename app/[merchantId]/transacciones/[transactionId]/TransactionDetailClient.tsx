'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, User, MapPin, Shield, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Info, Code } from 'lucide-react'
import CardBrandIcon from '@/components/CardBrandIcon'

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

  // Risk scoring functions
  const getCVVRiskScore = (cvcCheck: string | null | undefined): number => {
    if (!cvcCheck) return 25 // Unknown = medium-low risk
    const code = cvcCheck.toUpperCase()

    // CyberSource CVV codes
    if (code === 'M' || code === 'PASS') return 0  // Match = no risk
    if (code === 'N' || code === 'FAIL') return 50 // No match = high risk
    if (code === 'P') return 30 // Not processed = medium risk
    if (code === 'U' || code === 'S') return 20 // Unknown/Not supported = low-medium risk

    return 25 // Default for unknown codes
  }

  const getAVSRiskScore = (avsResult: string | null | undefined): number => {
    if (!avsResult) return 25 // Unknown = medium-low risk
    const code = avsResult.toUpperCase()

    // CyberSource/Visa AVS codes
    if (code === 'Y' || code === 'X') return 0  // Full match = no risk
    if (code === 'Z') return 15 // Zip match only = low risk
    if (code === 'A') return 15 // Address match only = low risk
    if (code === 'W') return 10 // 9-digit zip match = very low risk
    if (code === 'N') return 40 // No match = high risk
    if (code === 'U' || code === 'R' || code === 'S') return 25 // Unavailable/Retry/Not supported = medium risk
    if (code === 'E') return 30 // Error = medium-high risk

    return 25 // Default for unknown codes
  }

  const calculateRiskScore = (cvcCheck: string | null | undefined, avsResult: string | null | undefined): number => {
    const cvvScore = getCVVRiskScore(cvcCheck)
    const avsScore = getAVSRiskScore(avsResult)

    // Weighted average: CVV is slightly more important (60/40 split)
    return Math.round((cvvScore * 0.6) + (avsScore * 0.4))
  }

  const getRiskLevel = (score: number): { level: string; color: string; bgColor: string; description: string } => {
    if (score <= 25) {
      return {
        level: 'Riesgo Bajo',
        color: 'text-green-400',
        bgColor: 'bg-green-400',
        description: 'Esta transacción tiene baja probabilidad de fraude. Las verificaciones de seguridad fueron exitosas.'
      }
    } else if (score <= 50) {
      return {
        level: 'Riesgo Medio',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400',
        description: 'Esta transacción requiere atención. Algunas verificaciones de seguridad no pudieron completarse o fallaron parcialmente.'
      }
    } else {
      return {
        level: 'Riesgo Alto',
        color: 'text-red-400',
        bgColor: 'bg-red-400',
        description: 'Esta transacción tiene alta probabilidad de fraude. Se recomienda revisión manual antes de procesar.'
      }
    }
  }

  const getCVVExplanation = (cvcCheck: string | null | undefined): string => {
    if (!cvcCheck) return 'No se realizó verificación del código de seguridad (CVV).'
    const code = cvcCheck.toUpperCase()

    if (code === 'M' || code === 'PASS') return 'El código CVV coincide correctamente. Esto indica que el cliente tiene acceso a la tarjeta física.'
    if (code === 'N' || code === 'FAIL') return 'El código CVV NO coincide. Esto puede indicar que el cliente no tiene acceso a la tarjeta física o ingresó el código incorrectamente.'
    if (code === 'P') return 'El código CVV no fue procesado por el banco emisor.'
    if (code === 'U') return 'El banco emisor no está certificado para verificar CVV o no proporcionó la clave de encriptación.'
    if (code === 'S') return 'El CVV debería estar en la tarjeta pero no fue indicado en la transacción.'

    return `Código CVV desconocido: ${cvcCheck}`
  }

  const getAVSExplanation = (avsResult: string | null | undefined): string => {
    if (!avsResult) return 'No se realizó verificación de dirección (AVS).'
    const code = avsResult.toUpperCase()

    if (code === 'Y') return 'Dirección y código postal coinciden perfectamente.'
    if (code === 'X') return 'Dirección y código postal de 9 dígitos coinciden perfectamente.'
    if (code === 'A') return 'La dirección coincide, pero el código postal NO coincide.'
    if (code === 'Z') return 'El código postal coincide, pero la dirección NO coincide.'
    if (code === 'W') return 'El código postal de 9 dígitos coincide, pero la dirección NO coincide.'
    if (code === 'N') return 'Ni la dirección ni el código postal coinciden.'
    if (code === 'U') return 'Información de dirección no disponible del banco emisor.'
    if (code === 'R') return 'Sistema de verificación de dirección no disponible temporalmente. Reintentar.'
    if (code === 'S') return 'El banco emisor no soporta verificación de dirección (AVS).'
    if (code === 'E') return 'Error en el sistema de verificación de dirección.'

    return `Código AVS: ${avsResult}`
  }

  const charge = paymentIntent.charges?.[0]
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [showRawResponse, setShowRawResponse] = useState(false)
  const [showPaymentIntentJSON, setShowPaymentIntentJSON] = useState(false)
  const [activeTab, setActiveTab] = useState<'admin' | 'technical'>('admin')

  return (
    <div className="container-dashboard pt-6 sm:pt-8 pb-8 px-4 sm:px-6">
      {/* Back Button */}
      <Link
        href={`/${merchantId}/transacciones`}
        className="inline-flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        Volver a transacciones
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
            Detalle de Transacción
          </h1>
          <p className="text-[var(--color-textSecondary)] font-mono text-xs sm:text-sm truncate">
            {paymentIntent.id}
          </p>
        </div>
        <div className="flex-shrink-0">
          {getStatusBadge(paymentIntent.status)}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-[var(--color-border)]">
          <nav className="flex gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab('admin')}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm sm:text-base font-medium ${
                activeTab === 'admin'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] hover:border-[var(--color-border)]'
              }`}
            >
              Vista Administrativa
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm sm:text-base font-medium ${
                activeTab === 'technical'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] hover:border-[var(--color-border)]'
              }`}
            >
              Vista Técnica
            </button>
          </nav>
        </div>
      </div>

      {/* Administrative View */}
      {activeTab === 'admin' && (
      <div className="space-y-6 pb-6">
        {/* Payment Info Card - Full Width */}
        <div className="card bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-primary)]/10 border-[var(--color-primary)]/20">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-[var(--color-primary)]" />
            Información del Pago
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Monto</p>
              <p className="text-xl sm:text-2xl font-bold text-[var(--color-textPrimary)]">
                {formatCurrency(paymentIntent.amount, paymentIntent.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Fecha</p>
              <p className="text-sm font-medium text-[var(--color-textPrimary)] break-words">
                {formatDate(paymentIntent.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Estado</p>
              {getStatusBadge(paymentIntent.status)}
            </div>
            {paymentIntent.description && (
              <div className="col-span-1 sm:col-span-3">
                <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Descripción</p>
                <p className="text-sm text-[var(--color-textPrimary)] break-words">
                  {paymentIntent.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Payment Method Card */}
            {paymentIntent.payment_method && (
              <div className="card border-2 border-[var(--color-border)]">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                  <CreditCard size={20} className="text-[var(--color-primary)]" />
                  Método de Pago
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">Tipo de Tarjeta</p>
                    <p className="text-lg font-semibold text-[var(--color-textPrimary)] capitalize">
                      {paymentIntent.payment_method.type || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">Marca</p>
                    <div className="flex items-center gap-2">
                      <CardBrandIcon brand={paymentIntent.payment_method.brand} size={28} />
                      <p className="text-lg font-semibold text-[var(--color-textPrimary)] capitalize">
                        {paymentIntent.payment_method.brand || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">Número de Tarjeta</p>
                    <p className="text-lg font-mono font-bold text-[var(--color-textPrimary)]">
                      •••• •••• •••• {paymentIntent.payment_method.last4 || '****'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">Vencimiento</p>
                    <p className="text-lg font-mono font-bold text-[var(--color-textPrimary)]">
                      {paymentIntent.payment_method.exp_month?.toString().padStart(2, '0') || 'XX'}/
                      {paymentIntent.payment_method.exp_year || 'XXXX'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Info Card */}
            {paymentIntent.customer && (
              <div className="card border-2 border-[var(--color-border)] bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                  <User size={20} className="text-indigo-600" />
                  Información del Cliente
                </h2>
                <div className="space-y-3">
                  {paymentIntent.customer.name && (
                    <div className="p-3 rounded-lg bg-white/50 border border-indigo-500/20">
                      <p className="text-xs text-[var(--color-textSecondary)] mb-1">Nombre Completo</p>
                      <p className="text-base font-semibold text-[var(--color-textPrimary)] break-words">
                        {paymentIntent.customer.name}
                      </p>
                    </div>
                  )}
                  {paymentIntent.customer.email && (
                    <div className="p-3 rounded-lg bg-white/50 border border-indigo-500/20">
                      <p className="text-xs text-[var(--color-textSecondary)] mb-1">Correo Electrónico</p>
                      <p className="text-base font-semibold text-[var(--color-textPrimary)] break-all">
                        {paymentIntent.customer.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata Card */}
            {paymentIntent.metadata && Object.keys(paymentIntent.metadata).length > 0 && (
              <div className="card">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                  <Info size={20} className="text-[var(--color-primary)]" />
                  Metadata
                </h2>
                <div className="space-y-3">
                  {Object.entries(paymentIntent.metadata).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
                      <span className="text-xs sm:text-sm text-[var(--color-textSecondary)] font-medium">{key}</span>
                      <span className="text-sm font-medium text-[var(--color-textPrimary)] break-all">
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
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[var(--color-primary)]" />
                Resumen del Cargo
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">ID del Cargo</p>
                  <p className="text-xs font-mono text-[var(--color-textPrimary)] break-all">
                    {charge.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Monto Autorizado</p>
                    <p className="text-sm font-semibold text-[var(--color-textPrimary)]">
                      {formatCurrency(charge.amount_authorized, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.amount_captured !== undefined && charge.amount_captured > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Monto Capturado</p>
                    <p className="text-sm font-semibold text-[var(--color-success)]">
                      {formatCurrency(charge.amount_captured, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.amount_refunded !== undefined && charge.amount_refunded > 0 && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Monto Reembolsado</p>
                    <p className="text-sm font-semibold text-[var(--color-error)]">
                      {formatCurrency(charge.amount_refunded, paymentIntent.currency)}
                    </p>
                  </div>
                )}
                {charge.acquirer_reference && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Referencia Adquirente</p>
                    <p className="text-xs font-mono text-[var(--color-textPrimary)] break-all">
                      {charge.acquirer_reference}
                    </p>
                  </div>
                )}
                {charge.authorization_code && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Código de Autorización</p>
                    <p className="text-xs font-mono text-[var(--color-textPrimary)]">
                      {charge.authorization_code}
                    </p>
                  </div>
                )}
                {charge.network && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Red</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)] capitalize">
                      {charge.network}
                    </p>
                  </div>
                )}
                {charge.acquirer_name && (
                  <div>
                    <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mb-1">Procesador</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)] break-words">
                      {charge.acquirer_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risk Analysis Card - Enhanced */}
          {charge?.processor_response && (() => {
            const riskScore = calculateRiskScore(
              charge.processor_response.cvc_check,
              charge.processor_response.avs_result
            )
            const riskLevel = getRiskLevel(riskScore)

            return (
              <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-3 sm:mb-4 flex items-center gap-2">
                  <Shield size={18} className="sm:w-5 sm:h-5 text-blue-400" />
                  Análisis de Riesgo
                </h2>

                {/* Risk Score Overview - Simple for Non-Technical Users */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {/* Risk Level Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-textSecondary)]">Nivel de Riesgo</span>
                    <span className={`text-base sm:text-lg font-bold ${riskLevel.color}`}>
                      {riskLevel.level}
                    </span>
                  </div>

                  {/* Risk Score Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <span className="text-[var(--color-textSecondary)]">Puntuación de riesgo</span>
                      <span className={`font-mono font-bold ${riskLevel.color}`}>{riskScore}%</span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${riskLevel.bgColor} transition-all duration-500 ease-out`}
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] sm:text-[10px] text-[var(--color-textSecondary)]">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  {/* Risk Explanation */}
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-lg">
                    <p className="text-[11px] sm:text-xs text-[var(--color-textSecondary)] leading-relaxed">
                      {riskLevel.description}
                    </p>
                  </div>
                </div>

                {/* Security Checks - Simplified */}
                <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/5 rounded-lg">
                    <div className={`mt-0.5 text-sm sm:text-base ${
                      charge.processor_response.cvc_check?.toUpperCase() === 'M' ||
                      charge.processor_response.cvc_check?.toLowerCase() === 'pass'
                        ? 'text-green-400'
                        : charge.processor_response.cvc_check?.toUpperCase() === 'N' ||
                          charge.processor_response.cvc_check?.toLowerCase() === 'fail'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {charge.processor_response.cvc_check?.toUpperCase() === 'M' ||
                       charge.processor_response.cvc_check?.toLowerCase() === 'pass'
                        ? '✓'
                        : charge.processor_response.cvc_check?.toUpperCase() === 'N' ||
                          charge.processor_response.cvc_check?.toLowerCase() === 'fail'
                        ? '✗'
                        : '⚠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-xs sm:text-sm font-medium text-[var(--color-textPrimary)]">
                          Código de Seguridad (CVV)
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-[var(--color-textSecondary)] flex-shrink-0">
                          {charge.processor_response.cvc_check || 'N/A'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[var(--color-textSecondary)] leading-relaxed">
                        {getCVVExplanation(charge.processor_response.cvc_check)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white/5 rounded-lg">
                    <div className={`mt-0.5 text-sm sm:text-base ${
                      charge.processor_response.avs_result?.toUpperCase() === 'Y' ||
                      charge.processor_response.avs_result?.toUpperCase() === 'X'
                        ? 'text-green-400'
                        : charge.processor_response.avs_result?.toUpperCase() === 'N'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {charge.processor_response.avs_result?.toUpperCase() === 'Y' ||
                       charge.processor_response.avs_result?.toUpperCase() === 'X'
                        ? '✓'
                        : charge.processor_response.avs_result?.toUpperCase() === 'N'
                        ? '✗'
                        : '⚠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-xs sm:text-sm font-medium text-[var(--color-textPrimary)]">
                          Verificación de Dirección (AVS)
                        </span>
                        <span className="text-[10px] sm:text-xs font-mono text-[var(--color-textSecondary)] flex-shrink-0">
                          {charge.processor_response.avs_result || 'N/A'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[var(--color-textSecondary)] leading-relaxed">
                        {getAVSExplanation(charge.processor_response.avs_result)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Details - Collapsible */}
                <div className="border-t border-white/10 pt-3 sm:pt-4">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-textPrimary)] flex items-center gap-2">
                      <Info size={14} className="sm:w-4 sm:h-4 text-blue-400" />
                      Detalles Técnicos
                    </span>
                    {showTechnicalDetails ? (
                      <ChevronUp size={16} className="text-[var(--color-textSecondary)]" />
                    ) : (
                      <ChevronDown size={16} className="text-[var(--color-textSecondary)]" />
                    )}
                  </button>

                  {showTechnicalDetails && (
                    <div className="mt-3 space-y-3 animate-fadeIn">
                      {/* Processor Response Code */}
                      {charge.processor_response.code && (
                        <div className="p-3 bg-black/20 rounded-lg">
                          <span className="text-xs text-[var(--color-textSecondary)]">Código del Procesador</span>
                          <p className="text-sm font-mono text-[var(--color-textPrimary)] mt-1">
                            {charge.processor_response.code}
                          </p>
                        </div>
                      )}

                      {/* Processor Message */}
                      {charge.processor_response.message && (
                        <div className="p-3 bg-black/20 rounded-lg">
                          <span className="text-xs text-[var(--color-textSecondary)]">Mensaje del Procesador</span>
                          <p className="text-sm text-[var(--color-textPrimary)] mt-1">
                            {charge.processor_response.message}
                          </p>
                        </div>
                      )}

                      {/* Raw Response */}
                      {charge.processor_response.raw_response && (
                        <div className="p-3 bg-black/20 rounded-lg">
                          <span className="text-xs text-[var(--color-textSecondary)] mb-2 block">
                            Respuesta Completa (JSON)
                          </span>
                          <pre className="text-[10px] font-mono text-gray-300 overflow-x-auto">
                            {JSON.stringify(charge.processor_response.raw_response, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Risk Scoring Info */}
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-start gap-2">
                          <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-400 leading-relaxed">
                            <p className="font-medium mb-1">Cálculo de Puntuación:</p>
                            <p>• CVV: {getCVVRiskScore(charge.processor_response.cvc_check)} puntos (peso 60%)</p>
                            <p>• AVS: {getAVSRiskScore(charge.processor_response.avs_result)} puntos (peso 40%)</p>
                            <p className="mt-1">Score Total: {riskScore}% = {riskLevel.level}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
          </div>
        </div>
      </div>
      )}

      {/* Technical View */}
      {activeTab === 'technical' && (
      <div className="space-y-6 pb-6">
        {/* Transaction Overview - Technical */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <p className="text-xs text-[var(--color-textSecondary)] mb-2">Transaction ID</p>
            <p className="text-xs font-mono text-[var(--color-textPrimary)] break-all leading-tight">
              {paymentIntent.id}
            </p>
          </div>
          {charge && (
            <div className="card bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <p className="text-xs text-[var(--color-textSecondary)] mb-2">Charge ID</p>
              <p className="text-xs font-mono text-[var(--color-textPrimary)] break-all leading-tight">
                {charge.id}
              </p>
            </div>
          )}
          <div className="card bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <p className="text-xs text-[var(--color-textSecondary)] mb-2">Timestamp</p>
            <p className="text-xs font-mono text-[var(--color-textPrimary)]">
              {new Date(paymentIntent.created_at).toISOString()}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <p className="text-xs text-[var(--color-textSecondary)] mb-2">Environment</p>
            <p className="text-sm font-semibold text-[var(--color-textPrimary)]">
              {process.env.NEXT_PUBLIC_ENVIRONMENT || 'Production'}
            </p>
          </div>
        </div>

        {/* Processor Response Summary - Grid Layout */}
        {charge && charge.processor_response && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Key Technical Fields */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[var(--color-primary)]" />
                Respuesta del Procesador
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {charge.processor_response.code && (
                  <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">Código</p>
                    <p className="text-lg font-mono font-bold text-[var(--color-textPrimary)]">{charge.processor_response.code}</p>
                  </div>
                )}
                {charge.processor_response.cvc_check && (
                  <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">CVV Check</p>
                    <p className="text-lg font-mono font-bold text-[var(--color-textPrimary)]">{charge.processor_response.cvc_check}</p>
                  </div>
                )}
                {charge.processor_response.avs_result && (
                  <div className="p-3 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-textSecondary)] mb-2">AVS Result</p>
                    <p className="text-lg font-mono font-bold text-[var(--color-textPrimary)]">{charge.processor_response.avs_result}</p>
                  </div>
                )}
              </div>
              {charge.processor_response.message && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-2">Mensaje del Procesador</p>
                  <p className="text-sm text-[var(--color-textPrimary)]">{charge.processor_response.message}</p>
                </div>
              )}
            </div>

            {/* Right: Charge Technical Info */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                <Info size={20} className="text-[var(--color-primary)]" />
                Información Técnica del Cargo
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--color-textSecondary)] mb-1">Status del Cargo</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    charge.status === 'captured' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                    charge.status === 'authorized' ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' :
                    'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                  }`}>
                    {charge.status}
                  </span>
                </div>
                {charge.network && (
                  <div>
                    <p className="text-xs text-[var(--color-textSecondary)] mb-1">Red de Procesamiento</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)] capitalize">{charge.network}</p>
                  </div>
                )}
                {charge.acquirer_name && (
                  <div>
                    <p className="text-xs text-[var(--color-textSecondary)] mb-1">Procesador / Adquirente</p>
                    <p className="text-sm font-medium text-[var(--color-textPrimary)]">{charge.acquirer_name}</p>
                  </div>
                )}
                {charge.authorization_code && (
                  <div>
                    <p className="text-xs text-[var(--color-textSecondary)] mb-1">Código de Autorización</p>
                    <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">{charge.authorization_code}</p>
                  </div>
                )}
                {charge.acquirer_reference && (
                  <div>
                    <p className="text-xs text-[var(--color-textSecondary)] mb-1">Referencia del Adquirente</p>
                    <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)] break-all">{charge.acquirer_reference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Technical Details */}
        {paymentIntent.payment_method && (
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-[var(--color-primary)]" />
              Detalles Técnicos del Método de Pago
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-textSecondary)] mb-1">Tipo de Método</p>
                <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)] capitalize">
                  {paymentIntent.payment_method.type || 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-textSecondary)] mb-1">Marca de la Tarjeta</p>
                <div className="flex items-center gap-2">
                  <CardBrandIcon brand={paymentIntent.payment_method.brand} size={24} />
                  <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)] capitalize">
                    {paymentIntent.payment_method.brand || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-textSecondary)] mb-1">PAN (Últimos 4)</p>
                <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                  •••• •••• •••• {paymentIntent.payment_method.last4 || '****'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-background)]/50 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-textSecondary)] mb-1">Fecha de Expiración</p>
                <p className="text-sm font-mono font-medium text-[var(--color-textPrimary)]">
                  {paymentIntent.payment_method.exp_month?.toString().padStart(2, '0')}/{paymentIntent.payment_method.exp_year}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Amount Breakdown */}
        {charge && (
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
              <Info size={20} className="text-[var(--color-primary)]" />
              Desglose de Montos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {charge.amount_authorized !== undefined && (
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-2">Monto Autorizado</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(charge.amount_authorized, paymentIntent.currency)}
                  </p>
                  <p className="text-xs font-mono text-[var(--color-textSecondary)] mt-1">
                    {charge.amount_authorized} centavos
                  </p>
                </div>
              )}
              {charge.amount_captured !== undefined && (
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-2">Monto Capturado</p>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(charge.amount_captured, paymentIntent.currency)}
                  </p>
                  <p className="text-xs font-mono text-[var(--color-textSecondary)] mt-1">
                    {charge.amount_captured} centavos
                  </p>
                </div>
              )}
              {charge.amount_refunded !== undefined && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-2">Monto Reembolsado</p>
                  <p className="text-xl font-bold text-red-400">
                    {formatCurrency(charge.amount_refunded, paymentIntent.currency)}
                  </p>
                  <p className="text-xs font-mono text-[var(--color-textSecondary)] mt-1">
                    {charge.amount_refunded} centavos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Response JSON - Accordion */}
        {charge?.processor_response?.raw_response && (
          <div className="card border-2 border-[var(--color-border)]">
            <button
              onClick={() => setShowRawResponse(!showRawResponse)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-background)]/50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Code size={20} className="text-[var(--color-primary)]" />
                <div className="text-left">
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--color-textPrimary)]">
                    Raw Response (Procesador)
                  </h3>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Respuesta completa del procesador de pagos
                  </p>
                </div>
              </div>
              {showRawResponse ? (
                <ChevronUp size={20} className="text-[var(--color-textSecondary)] flex-shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-[var(--color-textSecondary)] flex-shrink-0" />
              )}
            </button>

            {showRawResponse && (
              <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                <div className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto border border-[var(--color-border)] max-h-96 overflow-y-auto">
                  <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                    {JSON.stringify(charge.processor_response.raw_response, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (charge?.processor_response?.raw_response) {
                        navigator.clipboard.writeText(JSON.stringify(charge.processor_response.raw_response, null, 2))
                      }
                    }}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Copiar JSON
                  </button>
                  <button
                    onClick={() => {
                      if (charge?.processor_response?.raw_response) {
                        const blob = new Blob([JSON.stringify(charge.processor_response.raw_response, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `processor-response-${charge.id}.json`
                        a.click()
                      }
                    }}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    Descargar JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Payment Intent JSON - Accordion */}
        <div className="card border-2 border-[var(--color-border)]">
          <button
            onClick={() => setShowPaymentIntentJSON(!showPaymentIntentJSON)}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-background)]/50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Code size={20} className="text-[var(--color-primary)]" />
              <div className="text-left">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-textPrimary)]">
                  Payment Intent Completo
                </h3>
                <p className="text-xs text-[var(--color-textSecondary)]">
                  Objeto completo de la transacción incluyendo todos los datos
                </p>
              </div>
            </div>
            {showPaymentIntentJSON ? (
              <ChevronUp size={20} className="text-[var(--color-textSecondary)] flex-shrink-0" />
            ) : (
              <ChevronDown size={20} className="text-[var(--color-textSecondary)] flex-shrink-0" />
            )}
          </button>

          {showPaymentIntentJSON && (
            <div className="px-4 pb-4 space-y-3 animate-fadeIn">
              <div className="bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto border border-[var(--color-border)] max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                  {JSON.stringify(paymentIntent, null, 2)}
                </pre>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(paymentIntent, null, 2))
                  }}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Copiar JSON
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(paymentIntent, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `transaction-${paymentIntent.id}.json`
                    a.click()
                  }}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Descargar JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* API Integration Info */}
        <div className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
            <Info size={20} className="text-indigo-400" />
            Información para Desarrolladores
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-[var(--color-textSecondary)]">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <p>
                <strong className="text-[var(--color-textPrimary)]">Idempotencia:</strong> Usa el ID de la transacción para operaciones idempotentes
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <p>
                <strong className="text-[var(--color-textPrimary)]">Webhooks:</strong> Asegúrate de validar la firma de los webhooks antes de procesar
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <p>
                <strong className="text-[var(--color-textPrimary)]">Reintento:</strong> Los códigos de respuesta del procesador indican si es seguro reintentar
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              <p>
                <strong className="text-[var(--color-textPrimary)]">Security:</strong> CVV y AVS son verificaciones críticas para prevenir fraude
              </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

