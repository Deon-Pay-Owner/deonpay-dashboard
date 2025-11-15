import { BookOpen, Code2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import ApiKeysDisplay from '@/components/ApiKeysDisplay'
import Link from 'next/link'

export default async function DesarrolladoresPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Fetch API keys for this merchant
  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const testKey = apiKeys?.find(key => key.key_type === 'test')

  // Fetch webhooks count
  const { count: webhooksCount } = await supabase
    .from('webhooks')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .eq('is_active', true)

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
          Desarrolladores
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Credenciales API, documentación y herramientas de integración
        </p>
      </div>

      {/* API Keys */}
      {error ? (
        <div className="card mb-6 bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30">
          <div className="flex items-center gap-2 text-[var(--color-danger)]">
            <AlertCircle size={20} />
            <p>Error al cargar las credenciales API. Por favor, contacta a soporte.</p>
          </div>
        </div>
      ) : testKey ? (
        <ApiKeysDisplay
          publicKey={testKey.public_key}
          secretKeyPrefix={testKey.secret_key_prefix}
          keyType={testKey.key_type as 'test' | 'live'}
          merchantId={merchantId}
          lastUsedAt={testKey.last_used_at}
          expiresAt={testKey.expires_at}
        />
      ) : (
        <div className="card mb-6 bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30">
          <div className="flex items-center gap-2 text-[var(--color-warning)]">
            <AlertCircle size={20} />
            <div>
              <p className="font-medium">No se encontraron credenciales API</p>
              <p className="text-sm">Contacta a soporte para generar tus credenciales.</p>
            </div>
          </div>
        </div>
      )}

      {/* Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
              Documentación
            </h2>
          </div>
          <div className="space-y-3">
            <a
              href="#"
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                Guía de inicio rápido
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Integra DeonPay en 5 minutos
              </p>
            </a>
            <a
              href="#"
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                Referencia de API
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Documentación completa de endpoints
              </p>
            </a>
            <Link
              href={`/${merchantId}/webhooks`}
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                  Webhooks
                </p>
                {webhooksCount !== null && webhooksCount > 0 && (
                  <span className="px-2 py-0.5 bg-[var(--color-primary)] text-white text-xs rounded-full">
                    {webhooksCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Configura notificaciones en tiempo real
              </p>
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
              Ejemplos de código
            </h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
              <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                Node.js / Express
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Backend con JavaScript/TypeScript
              </p>
            </button>
            <button className="w-full text-left p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
              <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                Python / Django
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Integración con Python
              </p>
            </button>
            <button className="w-full text-left p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors">
              <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                PHP / Laravel
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                Ejemplo con PHP moderno
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="card bg-[var(--color-surface)] border-[var(--color-border)]">
        <h2 className="text-lg font-semibold mb-4 text-[var(--color-textPrimary)]">Ejemplo rápido</h2>
        <pre className="text-sm overflow-x-auto bg-black/20 p-4 rounded-lg">
          <code className="text-[var(--color-textPrimary)]">{`// Instalar el SDK
npm install @deonpay/sdk

// Crear un pago
import { DeonPay } from '@deonpay/sdk'

const deonpay = new DeonPay('sk_test_xxx')

const payment = await deonpay.payments.create({
  amount: 10000, // $100.00 MXN
  currency: 'mxn',
  customer: {
    email: 'cliente@ejemplo.com'
  },
  metadata: {
    order_id: '123'
  }
})

console.log(payment.id) // pmt_xxxxx`}</code>
        </pre>
      </div>
    </div>
  )
}
