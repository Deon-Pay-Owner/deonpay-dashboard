'use client'

import { useState } from 'react'
import { User, Building2, Phone, Mail } from 'lucide-react'
import PhoneInput from '@/components/PhoneInput'

interface AccountFormProps {
  merchantId: string
  merchantName: string
  fullName: string
  phone: string
  email: string
  profileType: string
}

const PROFILE_TYPE_LABELS: Record<string, string> = {
  merchant_owner: 'Dueño de negocio',
  developer: 'Desarrollador',
  agency: 'Agencia',
}

export default function AccountForm({
  merchantId,
  merchantName: initialMerchantName,
  fullName: initialFullName,
  phone: initialPhone,
  email,
  profileType,
}: AccountFormProps) {
  const [merchantName, setMerchantName] = useState(initialMerchantName)
  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          merchant_name: merchantName,
          full_name: fullName,
          phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="card-header">Información de la cuenta</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 m-0">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 m-0">Cuenta actualizada exitosamente</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Merchant Name */}
        <div>
          <label htmlFor="merchantName" className="label-field">
            <Building2 size={16} className="inline mr-2" />
            Nombre del comercio
          </label>
          <input
            id="merchantName"
            type="text"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            className="input-field"
            required
            disabled={loading}
            minLength={2}
            maxLength={80}
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="label-field">
            <User size={16} className="inline mr-2" />
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
            required
            disabled={loading}
            minLength={2}
            maxLength={80}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label-field">
            <Phone size={16} className="inline mr-2" />
            Teléfono
          </label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            defaultCountry="MX"
            disabled={loading}
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="label-field">
            <Mail size={16} className="inline mr-2" />
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            className="input-field bg-gray-50"
            disabled
            readOnly
          />
          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
            El email no se puede modificar
          </p>
        </div>

        {/* Profile Type (read-only) */}
        <div>
          <label htmlFor="profileType" className="label-field">
            Tipo de perfil
          </label>
          <input
            id="profileType"
            type="text"
            value={PROFILE_TYPE_LABELS[profileType] || profileType}
            className="input-field bg-gray-50"
            disabled
            readOnly
          />
          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
            El tipo de perfil no se puede modificar
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
