'use client'

import { useState } from 'react'
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  Check,
  Code2,
  BookOpen,
  Webhook,
  Terminal,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  key: string
  type: 'public' | 'secret'
  name: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
  key_prefix: string | null
}

interface DesarrolladoresClientProps {
  merchantId: string
  apiKeys: ApiKey[]
  webhooksCount: number
}

export default function DesarrolladoresClient({
  merchantId,
  apiKeys,
  webhooksCount,
}: DesarrolladoresClientProps) {
  const [showSecretKeys, setShowSecretKeys] = useState<Record<string, boolean>>({})
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({})
  const [isRegenerating, setIsRegenerating] = useState(false)

  const publicKeys = apiKeys.filter(k => k.type === 'public')
  const secretKeys = apiKeys.filter(k => k.type === 'secret')

  const codeExample = `// Instalar el SDK
npm install @deonpay/sdk

// Crear un Payment Intent
import { DeonPay } from '@deonpay/sdk'

const deonpay = new DeonPay('${secretKeys[0]?.key || 'sk_live_xxxxx'}')

const paymentIntent = await deonpay.paymentIntents.create({
  amount: 10000, // $100.00 MXN (en centavos)
  currency: 'mxn',
  customer: {
    email: 'cliente@ejemplo.com',
    name: 'Juan Pérez'
  },
  metadata: {
    order_id: '123',
    product: 'Curso de programación'
  }
})

console.log('Payment Intent creado:', paymentIntent.id)
console.log('Client Secret:', paymentIntent.client_secret)

// Usar el client_secret en el frontend con DeonPay Elements
// https://elements.deonpay.mx`

  const copyToClipboard = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedKeys(prev => ({ ...prev, [keyId]: true }))
      setTimeout(() => {
        setCopiedKeys(prev => ({ ...prev, [keyId]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecretKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const handleRegenerateKeys = async () => {
    if (!confirm('¿Estás seguro de que deseas regenerar tus API keys? Esto invalidará las keys actuales y podría interrumpir integraciones activas.')) {
      return
    }

    setIsRegenerating(true)
    try {
      const response = await fetch(`/api/merchant/${merchantId}/regenerate-keys`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate keys')
      }

      // Reload the page to get new keys
      window.location.reload()
    } catch (error) {
      console.error('Error regenerating keys:', error)
      alert('Error al regenerar las keys. Por favor intenta de nuevo.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const maskKey = (key: string) => {
    if (key.length <= 12) return key
    return `${key.substring(0, 12)}${'•'.repeat(20)}`
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
          Desarrolladores
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Credenciales API, documentación y herramientas para integrar DeonPay
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent border-[var(--color-primary)]/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-primary)]/20 rounded-lg">
              <Key size={24} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{apiKeys.length}</p>
              <p className="text-sm text-[var(--color-textSecondary)]">API Keys Activas</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-[var(--color-info)]/10 to-transparent border-[var(--color-info)]/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-info)]/20 rounded-lg">
              <Webhook size={24} className="text-[var(--color-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{webhooksCount}</p>
              <p className="text-sm text-[var(--color-textSecondary)]">Webhooks Configurados</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-[var(--color-success)]/10 to-transparent border-[var(--color-success)]/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--color-success)]/20 rounded-lg">
              <Shield size={24} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">PCI-DSS</p>
              <p className="text-sm text-[var(--color-textSecondary)]">Compliant</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-xl font-bold text-[var(--color-textPrimary)]">
              Credenciales API
            </h2>
          </div>
          <button
            onClick={handleRegenerateKeys}
            disabled={isRegenerating}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
            {isRegenerating ? 'Regenerando...' : 'Regenerar Keys'}
          </button>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border-2 border-dashed border-[var(--color-border)]">
            <AlertCircle size={48} className="mx-auto mb-4 text-[var(--color-textSecondary)]" />
            <p className="text-[var(--color-textPrimary)] font-medium mb-2">
              No se encontraron credenciales API
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] mb-4">
              Genera tus primeras API keys para comenzar a integrar DeonPay
            </p>
            <button onClick={handleRegenerateKeys} className="btn-primary">
              Generar API Keys
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Public Keys */}
            {publicKeys.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                    Public Keys (Frontend)
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
                {publicKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                          {key.name || 'Public Key'}
                        </p>
                        {key.last_used_at && (
                          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                            Último uso: {new Date(key.last_used_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs rounded-full font-medium">
                        Pública
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={key.key}
                        className="flex-1 input-field font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="btn-secondary p-2"
                        title="Copiar"
                      >
                        {copiedKeys[key.id] ? (
                          <Check size={18} className="text-[var(--color-success)]" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-textSecondary)] mt-2">
                      Segura para usar en el frontend de tu aplicación
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Secret Keys */}
            {secretKeys.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                    Secret Keys (Backend)
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
                {secretKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-4 bg-gradient-to-br from-[var(--color-danger)]/5 to-transparent border border-[var(--color-danger)]/20 rounded-lg mb-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                          {key.name || 'Secret Key'}
                        </p>
                        {key.last_used_at && (
                          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                            Último uso: {new Date(key.last_used_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-xs rounded-full font-medium">
                        Privada
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={showSecretKeys[key.id] ? 'text' : 'password'}
                        readOnly
                        value={showSecretKeys[key.id] ? key.key : maskKey(key.key)}
                        className="flex-1 input-field font-mono text-sm"
                      />
                      <button
                        onClick={() => toggleSecretVisibility(key.id)}
                        className="btn-secondary p-2"
                        title={showSecretKeys[key.id] ? 'Ocultar' : 'Mostrar'}
                      >
                        {showSecretKeys[key.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className="btn-secondary p-2"
                        title="Copiar"
                      >
                        {copiedKeys[key.id] ? (
                          <Check size={18} className="text-[var(--color-success)]" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 p-2 bg-[var(--color-danger)]/10 rounded">
                      <AlertCircle size={14} className="text-[var(--color-danger)] flex-shrink-0" />
                      <p className="text-xs text-[var(--color-danger)]">
                        Nunca expongas esta key en el frontend. Solo úsala en tu servidor.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Start Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Documentation */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
              Documentación
            </h2>
          </div>
          <div className="space-y-3">
            <a
              href="https://docs.deonpay.mx/quickstart"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                    Guía de inicio rápido
                  </p>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Integra DeonPay en 5 minutos
                  </p>
                </div>
                <ExternalLink size={16} className="text-[var(--color-textSecondary)] group-hover:text-[var(--color-primary)]" />
              </div>
            </a>
            <a
              href="https://docs.deonpay.mx/api"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                    Referencia de API
                  </p>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Documentación completa de endpoints
                  </p>
                </div>
                <ExternalLink size={16} className="text-[var(--color-textSecondary)] group-hover:text-[var(--color-primary)]" />
              </div>
            </a>
            <Link
              href={`/${merchantId}/webhooks`}
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                    Webhooks
                  </p>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Configura notificaciones en tiempo real
                  </p>
                </div>
                {webhooksCount > 0 && (
                  <span className="px-2 py-0.5 bg-[var(--color-primary)] text-white text-xs rounded-full">
                    {webhooksCount}
                  </span>
                )}
              </div>
            </Link>
            <a
              href="https://elements.deonpay.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-textPrimary)] text-sm mb-1">
                    DeonPay Elements
                  </p>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Componentes de pago pre-construidos
                  </p>
                </div>
                <ExternalLink size={16} className="text-[var(--color-textSecondary)] group-hover:text-[var(--color-primary)]" />
              </div>
            </a>
          </div>
        </div>

        {/* SDKs & Libraries */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
              SDKs & Librerías
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                  JavaScript / TypeScript
                </p>
                <Zap size={16} className="text-[var(--color-warning)]" />
              </div>
              <pre className="text-xs text-[var(--color-textSecondary)] bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                npm install @deonpay/sdk
              </pre>
            </div>
            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg opacity-60">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                  Python
                </p>
                <span className="text-xs text-[var(--color-textSecondary)]">Próximamente</span>
              </div>
              <pre className="text-xs text-[var(--color-textSecondary)] bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                pip install deonpay
              </pre>
            </div>
            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg opacity-60">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                  PHP
                </p>
                <span className="text-xs text-[var(--color-textSecondary)]">Próximamente</span>
              </div>
              <pre className="text-xs text-[var(--color-textSecondary)] bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                composer require deonpay/deonpay-php
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={20} className="text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            Ejemplo rápido
          </h2>
        </div>
        <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
          <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">payment.ts</span>
            <button
              onClick={() => copyToClipboard(codeExample, 'code-example')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {copiedKeys['code-example'] ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-sm">
            <code className="text-gray-300">{codeExample}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
