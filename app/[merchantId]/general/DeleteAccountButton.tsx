'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'

interface DeleteAccountButtonProps {
  userEmail: string
}

export default function DeleteAccountButton({ userEmail }: DeleteAccountButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmEmail,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar la cuenta')
      }

      // Redirect to landing page
      window.location.href = result.redirectTo
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card border-red-200 bg-red-50/50">
        <h2 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} />
          Zona de peligro
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten certeza.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 size={16} />
          Eliminar mi cuenta
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-bold">Confirmar eliminación</h2>
            </div>

            <p className="text-gray-700 mb-4">
              Esta acción <strong>eliminará permanentemente</strong>:
            </p>

            <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Tu cuenta de usuario</li>
              <li>Todos tus comercios</li>
              <li>Tu perfil y datos personales</li>
              <li>Todas las relaciones de equipo</li>
            </ul>

            <p className="text-sm text-gray-700 mb-4">
              Para confirmar, escribe tu email: <strong>{userEmail}</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 m-0">{error}</p>
              </div>
            )}

            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={loading}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setConfirmEmail('')
                  setError('')
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || confirmEmail !== userEmail}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
