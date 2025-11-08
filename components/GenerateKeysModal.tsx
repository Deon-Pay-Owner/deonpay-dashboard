'use client'

import { useState } from 'react'
import { X, Copy, Check, AlertTriangle } from 'lucide-react'

interface GenerateKeysModalProps {
  isOpen: boolean
  onClose: () => void
  merchantId: string
  keyType: 'test' | 'live'
  onSuccess: () => void
}

export default function GenerateKeysModal({
  isOpen,
  onClose,
  merchantId,
  keyType,
  onSuccess,
}: GenerateKeysModalProps) {
  const [loading, setLoading] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<{
    publicKey: string
    secretKey: string
  } | null>(null)
  const [copiedPublic, setCopiedPublic] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          keyType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate keys')
      }

      setGeneratedKeys({
        publicKey: data.key.public_key,
        secretKey: data.secretKey,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)

      if (type === 'public') {
        setCopiedPublic(true)
        setTimeout(() => setCopiedPublic(false), 2000)
      } else {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      }
    }
  }

  const handleClose = () => {
    if (generatedKeys) {
      onSuccess()
    }
    setGeneratedKeys(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-background)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold text-[var(--color-textPrimary)]">
            {generatedKeys ? 'Nuevas API Keys Generadas' : 'Generar Nuevas API Keys'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--color-surface)] rounded transition-colors"
          >
            <X size={20} className="text-[var(--color-textSecondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedKeys ? (
            <>
              {/* Warning */}
              <div className="mb-6 p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg flex gap-3">
                <AlertTriangle size={20} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[var(--color-textPrimary)] mb-1">
                    ⚠️ Esta acción desactivará tus llaves actuales
                  </p>
                  <p className="text-[var(--color-textSecondary)]">
                    Las llaves API actuales de tipo <strong>{keyType === 'test' ? 'Test' : 'Live'}</strong> serán
                    desactivadas y ya no funcionarán. Cualquier integración que use las llaves anteriores
                    dejará de funcionar hasta que actualices las credenciales.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg">
                  <p className="text-sm text-[var(--color-danger)]">{error}</p>
                </div>
              )}

              {/* Action */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Generando...' : 'Generar Nuevas Keys'}
                </button>
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="mb-6 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 rounded-lg">
                <p className="text-sm text-[var(--color-success)] font-semibold mb-2">
                  ✓ Llaves generadas exitosamente
                </p>
                <p className="text-xs text-[var(--color-textSecondary)]">
                  Guarda la Secret Key ahora. No podrás verla nuevamente.
                </p>
              </div>

              {/* Keys display */}
              <div className="space-y-4 mb-6">
                {/* Public Key */}
                <div>
                  <label className="label-field">Public Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={generatedKeys.publicKey}
                      className="input-field font-mono text-xs sm:text-sm pr-12 w-full"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedKeys.publicKey, 'public')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--color-surface)] rounded transition-colors"
                    >
                      {copiedPublic ? (
                        <Check size={16} className="text-[var(--color-success)]" />
                      ) : (
                        <Copy size={16} className="text-[var(--color-textSecondary)]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Secret Key */}
                <div>
                  <label className="label-field">Secret Key</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={generatedKeys.secretKey}
                      className="input-field font-mono text-xs sm:text-sm pr-12 w-full bg-[var(--color-warning)]/10 border-[var(--color-warning)]"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedKeys.secretKey, 'secret')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--color-surface)] rounded transition-colors"
                    >
                      {copiedSecret ? (
                        <Check size={16} className="text-[var(--color-success)]" />
                      ) : (
                        <Copy size={16} className="text-[var(--color-textSecondary)]" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-danger)] mt-1">
                    ⚠️ Esta es la única vez que verás la Secret Key completa. Guárdala en un lugar seguro.
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="btn-primary w-full"
              >
                Entendido, he guardado las llaves
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
