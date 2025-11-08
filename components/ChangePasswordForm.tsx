'use client'

import { useState } from 'react'
import { Key, Eye, EyeOff } from 'lucide-react'

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden')
      }

      // Validate password strength
      if (newPassword.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }

      // Call API to change password
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña')
      }

      // Success
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="card-header flex items-center gap-2">
        <Key size={20} />
        Cambiar contraseña
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 font-medium">
              ✓ Contraseña actualizada exitosamente
            </p>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="label-field">Contraseña actual</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
            >
              {showCurrentPassword ? (
                <EyeOff size={18} className="text-[var(--color-textSecondary)]" />
              ) : (
                <Eye size={18} className="text-[var(--color-textSecondary)]" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="label-field">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
            >
              {showNewPassword ? (
                <EyeOff size={18} className="text-[var(--color-textSecondary)]" />
              ) : (
                <Eye size={18} className="text-[var(--color-textSecondary)]" />
              )}
            </button>
          </div>
          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
            Mínimo 8 caracteres
          </p>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="label-field">Confirmar nueva contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field pr-12"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--color-surface)] rounded transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className="text-[var(--color-textSecondary)]" />
              ) : (
                <Eye size={18} className="text-[var(--color-textSecondary)]" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          ⚠️ <strong>Importante:</strong> Después de cambiar tu contraseña, tendrás que iniciar sesión nuevamente en todos tus dispositivos.
        </p>
      </div>
    </div>
  )
}
