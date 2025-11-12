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

      {/* Más secciones pueden agregarse aquí en el futuro */}
      <div className="card bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-info)]/10 border border-[var(--color-primary)]/20">
        <p className="text-sm sm:text-base text-[var(--color-textSecondary)] text-center py-2">
          Más contenido de documentación se agregará próximamente...
        </p>
      </div>
    </div>
  )
}
