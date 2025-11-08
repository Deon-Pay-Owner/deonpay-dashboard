'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, Key, RefreshCw, Check } from 'lucide-react'
import GenerateKeysModal from './GenerateKeysModal'

interface ApiKeysDisplayProps {
  publicKey: string
  secretKeyPrefix: string
  keyType: 'test' | 'live'
  merchantId: string
  lastUsedAt?: string
  expiresAt?: string
  onKeysUpdated?: () => void
}

export default function ApiKeysDisplay({
  publicKey,
  secretKeyPrefix,
  keyType,
  merchantId,
  lastUsedAt,
  expiresAt,
  onKeysUpdated,
}: ApiKeysDisplayProps) {
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copiedPublic, setCopiedPublic] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const copyToClipboard = async (text: string, type: 'public' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'public') {
        setCopiedPublic(true)
        setTimeout(() => setCopiedPublic(false), 2000)
      } else {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        if (type === 'public') {
          setCopiedPublic(true)
          setTimeout(() => setCopiedPublic(false), 2000)
        } else {
          setCopiedSecret(true)
          setTimeout(() => setCopiedSecret(false), 2000)
        }
      } catch (e) {
        console.error('Fallback copy failed:', e)
      }
      document.body.removeChild(textarea)
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Key size={20} className="text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            Credenciales API
          </h2>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
            keyType === 'test'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {keyType === 'test' ? 'Test Mode' : 'Live Mode'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Publishable Key */}
        <div>
          <label className="label-field">Publishable Key (Pública)</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={publicKey}
                className="input-field font-mono text-xs sm:text-sm pr-12 overflow-x-auto"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => copyToClipboard(publicKey, 'public')}
                  className="p-2 hover:bg-[var(--color-surface)] rounded transition-colors bg-[var(--color-background)]"
                  title="Copiar"
                >
                  {copiedPublic ? (
                    <Check size={16} className="text-[var(--color-success)]" />
                  ) : (
                    <Copy size={16} className="text-[var(--color-textSecondary)]" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
            Esta key es segura para usar en el frontend de tu aplicación
          </p>
        </div>

        {/* Secret Key */}
        <div>
          <label className="label-field">Secret Key (Privada)</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showSecretKey ? 'text' : 'password'}
                readOnly
                value={secretKeyPrefix}
                className="input-field font-mono text-xs sm:text-sm pr-24 overflow-x-auto"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-2 hover:bg-[var(--color-surface)] rounded transition-colors bg-[var(--color-background)]"
                  title={showSecretKey ? 'Ocultar' : 'Mostrar'}
                >
                  {showSecretKey ? (
                    <EyeOff size={16} className="text-[var(--color-textSecondary)]" />
                  ) : (
                    <Eye size={16} className="text-[var(--color-textSecondary)]" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(secretKeyPrefix, 'secret')}
                  className="p-2 hover:bg-[var(--color-surface)] rounded transition-colors bg-[var(--color-background)]"
                  title="Copiar"
                >
                  {copiedSecret ? (
                    <Check size={16} className="text-[var(--color-success)]" />
                  ) : (
                    <Copy size={16} className="text-[var(--color-textSecondary)]" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-danger)] mt-1">
            ⚠️ Nunca expongas esta key en el frontend. Solo úsala en tu servidor.
          </p>
        </div>

        {/* Key Metadata */}
        {(lastUsedAt || expiresAt) && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-[var(--color-textSecondary)] pt-2 border-t border-[var(--color-border)]">
            {lastUsedAt && (
              <div>
                <span className="font-medium">Último uso:</span>{' '}
                {new Date(lastUsedAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            {expiresAt && (
              <div>
                <span className="font-medium">Expira:</span>{' '}
                {new Date(expiresAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg">
        <p className="text-xs sm:text-sm text-[var(--color-textPrimary)]">
          <strong>Modo de prueba:</strong> Estas credenciales son de prueba.
          Las transacciones no procesarán dinero real. Activa el modo producción
          cuando estés listo para ir en vivo.
        </p>
      </div>

      {/* Generate New Keys Button */}
      <div className="mt-4">
        <button
          className="btn-secondary flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
          onClick={() => setShowGenerateModal(true)}
        >
          <RefreshCw size={16} />
          <span className="text-sm">Generar nuevas keys</span>
        </button>
      </div>

      {/* Generate Keys Modal */}
      <GenerateKeysModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        merchantId={merchantId}
        keyType={keyType}
        onSuccess={() => {
          if (onKeysUpdated) {
            onKeysUpdated()
          }
        }}
      />
    </div>
  )
}
