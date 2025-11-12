'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, User, MapPin, Shield, Server, AlertCircle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react'

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

          {/* Risk Analysis Card - Enhanced */}
          {charge?.processor_response && (() => {
            const riskScore = calculateRiskScore(
              charge.processor_response.cvc_check,
              charge.processor_response.avs_result
            )
            const riskLevel = getRiskLevel(riskScore)

            return (
              <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h2 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-400" />
                  Análisis de Riesgo
                </h2>

                {/* Risk Score Overview - Simple for Non-Technical Users */}
                <div className="space-y-4 mb-6">
                  {/* Risk Level Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-textSecondary)]">Nivel de Riesgo</span>
                    <span className={`text-lg font-bold ${riskLevel.color}`}>
                      {riskLevel.level}
                    </span>
                  </div>

                  {/* Risk Score Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-textSecondary)]">Puntuación de riesgo</span>
                      <span className={`font-mono font-bold ${riskLevel.color}`}>{riskScore}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${riskLevel.bgColor} transition-all duration-500 ease-out`}
                        style={{ width: `${riskScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--color-textSecondary)]">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>

                  {/* Risk Explanation */}
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-[var(--color-textSecondary)] leading-relaxed">
                      {riskLevel.description}
                    </p>
                  </div>
                </div>

                {/* Security Checks - Simplified */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`mt-0.5 ${
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
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--color-textPrimary)]">
                          Código de Seguridad (CVV)
                        </span>
                        <span className="text-xs font-mono text-[var(--color-textSecondary)]">
                          {charge.processor_response.cvc_check || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-textSecondary)] leading-relaxed">
                        {getCVVExplanation(charge.processor_response.cvc_check)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`mt-0.5 ${
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
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--color-textPrimary)]">
                          Verificación de Dirección (AVS)
                        </span>
                        <span className="text-xs font-mono text-[var(--color-textSecondary)]">
                          {charge.processor_response.avs_result || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-textSecondary)] leading-relaxed">
                        {getAVSExplanation(charge.processor_response.avs_result)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Details - Collapsible */}
                <div className="border-t border-white/10 pt-4">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--color-textPrimary)] flex items-center gap-2">
                      <Info size={16} className="text-blue-400" />
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
  )
}
