'use client'

import { useState } from 'react'
import { Code, Copy, Check } from 'lucide-react'

export default function DocumentacionClient({ merchantId }: { merchantId: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const CodeBlock = ({ code, language = 'javascript', id }: { code: string; language?: string; id: string }) => {
    return (
      <div className="relative group">
        <button
          onClick={() => copyCode(code, id)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
          aria-label="Copiar código"
        >
          {copiedCode === id ? (
            <Check size={14} className="sm:w-4 sm:h-4 text-green-400" />
          ) : (
            <Copy size={14} className="sm:w-4 sm:h-4 text-white/70" />
          )}
        </button>
        <pre className="bg-[#1e1e1e] p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
          <code className={`language-${language} text-gray-300`}>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Payment Intents Section */}
      <div className="card">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-textPrimary)] mb-3 sm:mb-4 flex items-center gap-2">
          <Code size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)] flex-shrink-0" />
          <span>Payment Intents</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-textSecondary)] mb-4 sm:mb-6 leading-relaxed">
          Los Payment Intents representan la intención de procesar un pago. Siguen el estado del pago desde
          la creación hasta su finalización, ya sea exitosa o fallida.
        </p>

        {/* Crear Payment Intent */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-2 sm:mb-3">
            1. Crear un Payment Intent
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3 sm:mb-4 leading-relaxed">
            Crea un Payment Intent especificando el monto y la moneda. Este paso inicializa la transacción.
          </p>

          <div className="bg-[var(--color-border)]/20 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 overflow-x-auto">
            <p className="text-xs sm:text-sm font-mono text-[var(--color-textSecondary)] whitespace-nowrap">
              <span className="font-semibold text-[var(--color-success)]">POST</span> https://api.deonpay.mx/api/v1/payment_intents
            </p>
          </div>

          <CodeBlock
            id="create-pi"
            code={`// Request
curl -X POST https://api.deonpay.mx/api/v1/payment_intents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 15000,
    "currency": "mxn",
    "description": "Pago de ejemplo",
    "metadata": {
      "order_id": "order_123"
    }
  }'

// Response
{
  "id": "pi_abc123...",
  "object": "payment_intent",
  "amount": 15000,
  "currency": "mxn",
  "status": "requires_payment_method",
  "description": "Pago de ejemplo",
  "created_at": "2025-11-12T06:54:43Z",
  "metadata": {
    "order_id": "order_123"
  }
}`}
          />

          <div className="mt-3 sm:mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-blue-400 mb-2">Parámetros</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--color-textSecondary)]">
              <li className="leading-relaxed"><code className="text-blue-400">amount</code> (requerido): Monto en centavos (ej: 15000 = $150.00 MXN)</li>
              <li className="leading-relaxed"><code className="text-blue-400">currency</code> (requerido): Código de moneda ISO (mxn, usd, etc.)</li>
              <li className="leading-relaxed"><code className="text-blue-400">description</code> (opcional): Descripción del pago</li>
              <li className="leading-relaxed"><code className="text-blue-400">metadata</code> (opcional): Datos adicionales en formato JSON</li>
            </ul>
          </div>
        </div>

        {/* Confirmar Payment Intent */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-2 sm:mb-3">
            2. Confirmar el Payment Intent
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3 sm:mb-4 leading-relaxed">
            Una vez que tienes los datos de la tarjeta del cliente, confirma el Payment Intent.
            Esto procesa el pago con los datos proporcionados.
          </p>

          <div className="bg-[var(--color-border)]/20 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 overflow-x-auto">
            <p className="text-xs sm:text-sm font-mono text-[var(--color-textSecondary)] whitespace-nowrap">
              <span className="font-semibold text-[var(--color-success)]">POST</span> https://api.deonpay.mx/api/v1/payment_intents/:id/confirm
            </p>
          </div>

          <CodeBlock
            id="confirm-pi"
            code={`// Request
curl -X POST https://api.deonpay.mx/api/v1/payment_intents/pi_abc123.../confirm \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_method": {
      "type": "card",
      "number": "4111111111111111",
      "exp_month": 12,
      "exp_year": 2025,
      "cvv": "123"
    },
    "billing_details": {
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "address": {
        "line1": "Av. Ejemplo 123",
        "city": "Ciudad de México",
        "state": "CDMX",
        "postal_code": "01000",
        "country": "MX"
      }
    }
  }'

// Response (Exitoso)
{
  "id": "pi_abc123...",
  "object": "payment_intent",
  "amount": 15000,
  "currency": "mxn",
  "status": "succeeded",
  "description": "Pago de ejemplo",
  "payment_method": {
    "type": "card",
    "brand": "visa",
    "last4": "1111"
  },
  "charges": [{
    "id": "ch_xyz789...",
    "status": "captured",
    "amount_captured": 15000,
    "acquirer_reference": "ref_123456"
  }]
}`}
          />

          <div className="mt-3 sm:mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
            <h4 className="text-sm sm:text-base font-semibold text-blue-400 mb-2">Parámetros</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[var(--color-textSecondary)]">
              <li className="leading-relaxed"><code className="text-blue-400">payment_method</code> (requerido): Datos de la tarjeta
                <ul className="ml-3 sm:ml-4 mt-1 space-y-0.5 sm:space-y-1">
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">number</code>: Número de tarjeta (16 dígitos)</li>
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">exp_month</code>: Mes de vencimiento (1-12)</li>
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">exp_year</code>: Año de vencimiento (YYYY)</li>
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">cvv</code>: Código de seguridad (3-4 dígitos)</li>
                </ul>
              </li>
              <li className="leading-relaxed"><code className="text-blue-400">billing_details</code> (requerido): Datos de facturación
                <ul className="ml-3 sm:ml-4 mt-1 space-y-0.5 sm:space-y-1">
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">name</code>: Nombre del tarjetahabiente</li>
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">email</code>: Email del cliente</li>
                  <li className="text-[11px] sm:text-xs">• <code className="text-blue-300">address</code>: Dirección completa</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        {/* Estados del Payment Intent */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-2 sm:mb-3">
            Estados del Payment Intent
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3 sm:mb-4 leading-relaxed">
            Los Payment Intents pasan por diferentes estados durante su ciclo de vida:
          </p>

          <div className="space-y-2.5 sm:space-y-3">
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-500/20 text-gray-400">
                requires_payment_method
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                Estado inicial. Esperando que se proporcione un método de pago.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-yellow-500/20 text-yellow-400">
                processing
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                El pago está siendo procesado por el procesador de pagos.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-500/20 text-blue-400">
                requires_action
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                Requiere acción adicional del cliente (ej: autenticación 3D Secure).
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-500/20 text-green-400">
                succeeded
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                El pago fue procesado exitosamente y los fondos fueron capturados.
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-500/20 text-red-400">
                failed
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                El pago falló (fondos insuficientes, tarjeta rechazada, etc.).
              </p>
            </div>

            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 sm:p-4">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-500/20 text-gray-400">
                canceled
              </span>
              <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] mt-1.5 sm:mt-2 leading-relaxed">
                El Payment Intent fue cancelado antes de completarse.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Prueba */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-textPrimary)] mb-2 sm:mb-3">
            Tarjetas de Prueba
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3 sm:mb-4 leading-relaxed">
            Usa estas tarjetas en el ambiente de sandbox para probar diferentes escenarios:
          </p>

          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-3 sm:px-0">
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-[var(--color-border)]/20">
                  <tr>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-[var(--color-textPrimary)]">Número</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-[var(--color-textPrimary)]">Marca</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-[var(--color-textPrimary)]">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  <tr>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-[var(--color-textSecondary)] text-[11px] sm:text-sm">4111111111111111</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-[var(--color-textSecondary)]">Visa</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-500/20 text-green-400 whitespace-nowrap">
                        Aprobada
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-[var(--color-textSecondary)] text-[11px] sm:text-sm">5555555555554444</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-[var(--color-textSecondary)]">Mastercard</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-500/20 text-green-400 whitespace-nowrap">
                        Aprobada
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-[var(--color-textSecondary)] text-[11px] sm:text-sm">4000000000000002</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-[var(--color-textSecondary)]">Visa</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-500/20 text-red-400 whitespace-nowrap">
                        Rechazada
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-400 leading-relaxed">
              <strong>Nota:</strong> Para todas las tarjetas de prueba, usa cualquier fecha de vencimiento futura
              y cualquier CVV de 3 dígitos.
            </p>
          </div>
        </div>
      </div>

      {/* Test Matrix Section */}
      <div className="card border-2 border-[var(--color-primary)]/30">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-textPrimary)] mb-3 sm:mb-4 flex items-center gap-2">
          <Code size={20} className="sm:w-6 sm:h-6 text-[var(--color-primary)] flex-shrink-0" />
          <span>Matriz de Pruebas - Flujos Completos</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-textSecondary)] mb-4 sm:mb-6 leading-relaxed">
          Matriz completa para probar todos los flujos de transacciones y webhooks. Incluye todos los estados posibles y eventos del sistema.
        </p>

        {/* Test Scenarios Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-[var(--color-border)]">
            <thead className="bg-[var(--color-surface)]">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-textPrimary)] uppercase tracking-wider">
                  Escenario
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-textPrimary)] uppercase tracking-wider">
                  Flujo
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-textPrimary)] uppercase tracking-wider">
                  Eventos Emitidos
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-[var(--color-textPrimary)] uppercase tracking-wider">
                  Card de Prueba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {/* Scenario 1: Successful Payment - Automatic Capture */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-green-400">✅ Pago Exitoso (Captura Automática)</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear Payment Intent</li>
                    <li>Confirmar con tarjeta</li>
                    <li>Se autoriza y captura automáticamente</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">payment_intent.created</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-mono">charge.authorized</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">charge.captured</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">payment_intent.succeeded</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  4242424242424242
                </td>
              </tr>

              {/* Scenario 2: Manual Capture */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-yellow-400">⏸️ Autorización + Captura Manual</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear PI con capture_method: 'manual'</li>
                    <li>Confirmar con tarjeta</li>
                    <li>Se autoriza (NO captura)</li>
                    <li>Capturar manualmente después</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">payment_intent.created</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-mono">charge.authorized</span>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-mono">payment_intent.processing</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">charge.captured</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">payment_intent.succeeded</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  4242424242424242
                </td>
              </tr>

              {/* Scenario 3: Failed Payment */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-red-400">❌ Pago Rechazado</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear Payment Intent</li>
                    <li>Confirmar con tarjeta de prueba rechazada</li>
                    <li>La autorización falla</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">payment_intent.created</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">charge.failed</span>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-mono">payment_intent.failed</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  4000000000000002
                </td>
              </tr>

              {/* Scenario 4: Void/Cancel */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-gray-400">🚫 Anular Autorización</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear PI con capture_method: 'manual'</li>
                    <li>Confirmar con tarjeta</li>
                    <li>Anular la autorización (void)</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">payment_intent.created</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-mono">charge.authorized</span>
                    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs font-mono">charge.voided</span>
                    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs font-mono">payment_intent.canceled</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  4242424242424242
                </td>
              </tr>

              {/* Scenario 5: Refund */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-indigo-400">↩️ Reembolso Completo</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Completar pago exitoso</li>
                    <li>Crear reembolso del monto completo</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">refund.created</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">refund.succeeded</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  4242424242424242
                </td>
              </tr>

              {/* Scenario 6: 3D Secure (if supported) */}
              <tr className="hover:bg-[var(--color-surface)]/50">
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-purple-400">🔐 Autenticación 3DS</span>
                </td>
                <td className="py-4 px-4 text-sm text-[var(--color-textSecondary)]">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Crear Payment Intent</li>
                    <li>Confirmar con tarjeta que requiere 3DS</li>
                    <li>Redirigir a autenticación</li>
                    <li>Completar después de auth</li>
                  </ol>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">payment_intent.created</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">payment_intent.requires_action</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-mono">charge.authorized</span>
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-mono">payment_intent.succeeded</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                  (Depende del procesador)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Postman Collection Download */}
      <div className="card border-2 border-[var(--color-success)]/30 bg-gradient-to-br from-[var(--color-success)]/5 to-[var(--color-primary)]/5">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-textPrimary)] mb-3 sm:mb-4 flex items-center gap-2">
          <Code size={20} className="sm:w-6 sm:h-6 text-[var(--color-success)] flex-shrink-0" />
          <span>Postman Collection</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-textSecondary)] mb-4 leading-relaxed">
          Collection completo de Postman con todos los endpoints, ejemplos de requests y tests automatizados.
          Incluye variables de entorno pre-configuradas.
        </p>

        <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] mb-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">📋 Lo que incluye el Collection:</h3>
          <ul className="space-y-2 text-sm text-[var(--color-textSecondary)]">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Payment Intents:</strong> Create, Confirm, Capture, Get, List</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Charges:</strong> Capture manual, Void authorization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Refunds:</strong> Create full/partial refunds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Customers:</strong> Create, Update, Get, List</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Variables de entorno:</strong> API Key, Base URL, IDs dinámicos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Tests automatizados:</strong> Validación de responses, status codes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span><strong>Ejemplos pre-configurados:</strong> Todos los escenarios de la matriz de pruebas</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            const collection = generatePostmanCollection(merchantId)
            const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'DeonPay-API-Collection.postman_collection.json'
            a.click()
          }}
          className="btn-primary w-full sm:w-auto"
        >
          📥 Descargar Postman Collection
        </button>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400 mb-2">
            <strong>💡 Instrucciones de uso:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-[var(--color-textSecondary)]">
            <li>Descarga el collection haciendo clic en el botón de arriba</li>
            <li>Importa el archivo JSON en Postman (File → Import)</li>
            <li>Ve a la sección de Desarrolladores y copia tu API Key</li>
            <li>En Postman, abre las variables de entorno y pega tu API Key</li>
            <li>¡Listo! Ahora puedes ejecutar todas las pruebas</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

// Postman Collection Generator
function generatePostmanCollection(merchantId: string) {
  return {
    "info": {
      "name": "DeonPay API - Complete Collection",
      "description": "Collection completo de la API de DeonPay con todos los endpoints, ejemplos y tests automatizados.",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      "_postman_id": crypto.randomUUID()
    },
    "auth": {
      "type": "bearer",
      "bearer": [
        {
          "key": "token",
          "value": "{{api_key}}",
          "type": "string"
        }
      ]
    },
    "variable": [
      {
        "key": "base_url",
        "value": "https://api.deonpay.mx",
        "type": "string"
      },
      {
        "key": "api_key",
        "value": "sk_test_YOUR_API_KEY_HERE",
        "type": "string"
      },
      {
        "key": "merchant_id",
        "value": merchantId,
        "type": "string"
      },
      {
        "key": "payment_intent_id",
        "value": "",
        "type": "string"
      },
      {
        "key": "charge_id",
        "value": "",
        "type": "string"
      },
      {
        "key": "customer_id",
        "value": "",
        "type": "string"
      }
    ],
    "item": [
      {
        "name": "Payment Intents",
        "item": [
          {
            "name": "1. Create Payment Intent",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Status code is 201\", function () {",
                    "    pm.response.to.have.status(201);",
                    "});",
                    "",
                    "pm.test(\"Response has payment intent\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData).to.have.property('id');",
                    "    pm.expect(jsonData.status).to.eql('requires_payment_method');",
                    "    pm.environment.set('payment_intent_id', jsonData.id);",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "amount": 10000,
                  "currency": "MXN",
                  "description": "Prueba de pago - Scenario 1",
                  "capture_method": "automatic",
                  "metadata": {
                    "order_id": "order_123456",
                    "customer_name": "Juan Pérez",
                    "test_scenario": "successful_payment"
                  }
                }, null, 2)
              },
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents"]
              }
            }
          },
          {
            "name": "2. Confirm Payment Intent (Auto Capture)",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Status code is 200\", function () {",
                    "    pm.response.to.have.status(200);",
                    "});",
                    "",
                    "pm.test(\"Payment succeeded\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData.paymentIntent.status).to.eql('succeeded');",
                    "    pm.expect(jsonData.charge).to.exist;",
                    "    pm.environment.set('charge_id', jsonData.charge.id);",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "payment_method": {
                    "type": "card",
                    "number": "4242424242424242",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "cvv": "123"
                  },
                  "billing_details": {
                    "name": "Juan Pérez",
                    "email": "juan.perez@example.com",
                    "address": {
                      "line1": "Av. Reforma 123",
                      "city": "Ciudad de México",
                      "state": "CDMX",
                      "postal_code": "01000",
                      "country": "MX"
                    }
                  }
                }, null, 2)
              },
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents/{{payment_intent_id}}/confirm",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents", "{{payment_intent_id}}", "confirm"]
              }
            }
          },
          {
            "name": "3. Create PI - Manual Capture",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "pm.environment.set('payment_intent_id', jsonData.id);"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "amount": 5000,
                  "currency": "MXN",
                  "description": "Prueba - Captura manual",
                  "capture_method": "manual",
                  "metadata": {
                    "order_id": "order_789",
                    "test_scenario": "manual_capture"
                  }
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents"]
              }
            }
          },
          {
            "name": "4. Confirm PI - Manual Capture",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Payment authorized (not captured)\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData.paymentIntent.status).to.eql('processing');",
                    "    pm.expect(jsonData.charge.status).to.eql('authorized');",
                    "    pm.environment.set('charge_id', jsonData.charge.id);",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "payment_method": {
                    "type": "card",
                    "number": "4242424242424242",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "cvv": "123"
                  }
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents/{{payment_intent_id}}/confirm",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents", "{{payment_intent_id}}", "confirm"]
              }
            }
          },
          {
            "name": "5. Get Payment Intent",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents/{{payment_intent_id}}",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents", "{{payment_intent_id}}"]
              }
            }
          },
          {
            "name": "6. List Payment Intents",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents?limit=10&offset=0",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents"],
                "query": [
                  {
                    "key": "limit",
                    "value": "10"
                  },
                  {
                    "key": "offset",
                    "value": "0"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "Charges",
        "item": [
          {
            "name": "1. Capture Charge",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Charge captured successfully\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData.charge.status).to.eql('captured');",
                    "    pm.expect(jsonData.paymentIntent.status).to.eql('succeeded');",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "amount_to_capture": 5000
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/charges/{{charge_id}}/capture",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "charges", "{{charge_id}}", "capture"]
              }
            }
          },
          {
            "name": "2. Void Charge",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Charge voided successfully\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData.charge.status).to.eql('voided');",
                    "    pm.expect(jsonData.paymentIntent.status).to.eql('canceled');",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "url": {
                "raw": "{{base_url}}/api/v1/charges/{{charge_id}}/void",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "charges", "{{charge_id}}", "void"]
              }
            }
          }
        ]
      },
      {
        "name": "Refunds",
        "item": [
          {
            "name": "1. Create Full Refund",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Refund created\", function () {",
                    "    var jsonData = pm.response.json();",
                    "    pm.expect(jsonData.refund).to.exist;",
                    "    pm.expect(jsonData.refund.status).to.be.oneOf(['pending', 'succeeded']);",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "charge_id": "{{charge_id}}",
                  "reason": "Solicitud del cliente"
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/refunds",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "refunds"]
              }
            }
          },
          {
            "name": "2. Create Partial Refund",
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "charge_id": "{{charge_id}}",
                  "amount": 2500,
                  "reason": "Reembolso parcial"
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/refunds",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "refunds"]
              }
            }
          }
        ]
      },
      {
        "name": "Customers",
        "item": [
          {
            "name": "1. Create Customer",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "pm.environment.set('customer_id', jsonData.id);"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "email": "cliente@example.com",
                  "name": "María González",
                  "phone": "+52 55 1234 5678",
                  "metadata": {
                    "source": "postman_test"
                  }
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/customers",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "customers"]
              }
            }
          },
          {
            "name": "2. Get Customer",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{base_url}}/api/v1/customers/{{customer_id}}",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "customers", "{{customer_id}}"]
              }
            }
          },
          {
            "name": "3. List Customers",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{base_url}}/api/v1/customers?limit=10",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "customers"],
                "query": [
                  {
                    "key": "limit",
                    "value": "10"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "Test Scenarios",
        "item": [
          {
            "name": "Scenario: Failed Payment",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "pm.test(\"Payment should fail\", function () {",
                    "    pm.expect(pm.response.code).to.be.oneOf([400, 500]);",
                    "});"
                  ]
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [],
              "body": {
                "mode": "raw",
                "raw": JSON.stringify({
                  "payment_method": {
                    "type": "card",
                    "number": "4000000000000002",
                    "exp_month": 12,
                    "exp_year": 2025,
                    "cvv": "123"
                  }
                }, null, 2),
                "options": {
                  "raw": {
                    "language": "json"
                  }
                }
              },
              "url": {
                "raw": "{{base_url}}/api/v1/payment_intents/{{payment_intent_id}}/confirm",
                "host": ["{{base_url}}"],
                "path": ["api", "v1", "payment_intents", "{{payment_intent_id}}", "confirm"]
              }
            }
          }
        ]
      }
    ]
  }
}
