'use client'

import { useState } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface Session {
  id: string
  login_at: string
  logout_at?: string
  ip_address?: string
  device_type?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  is_active: boolean
}

interface SessionsDisplayProps {
  sessions: Session[]
}

const SESSIONS_PER_PAGE = 5

export default function SessionsDisplay({ sessions }: SessionsDisplayProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(sessions.length / SESSIONS_PER_PAGE)
  const startIndex = (currentPage - 1) * SESSIONS_PER_PAGE
  const endIndex = startIndex + SESSIONS_PER_PAGE
  const currentSessions = sessions.slice(startIndex, endIndex)

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone size={18} />
      case 'tablet':
        return <Tablet size={18} />
      default:
        return <Monitor size={18} />
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-header flex items-center gap-2 mb-0">
          <Clock size={20} />
          Historial de sesiones
        </h2>
        <span className="text-sm text-[var(--color-textSecondary)]">
          Últimos 7 días
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--color-textSecondary)]">
            No hay sesiones registradas en los últimos 7 días
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {currentSessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  session.is_active
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getDeviceIcon(session.device_type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-[var(--color-textPrimary)] text-sm">
                      {session.browser || 'Navegador desconocido'} - {session.os || 'SO desconocido'}
                    </p>
                    {session.is_active && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Activa
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
                      <Clock size={14} />
                      <span>
                        {new Date(session.login_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {(session.city || session.country || session.ip_address) && (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
                        <MapPin size={14} />
                        <span>
                          {[session.city, session.country, session.ip_address]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-[var(--color-textSecondary)] sm:text-right">
                <p className="capitalize">{session.device_type || 'Dispositivo'}</p>
              </div>
            </div>
          ))}
        </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
              <div className="text-sm text-[var(--color-textSecondary)]">
                Mostrando {startIndex + 1}-{Math.min(endIndex, sessions.length)} de {sessions.length} sesiones
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Si ves alguna sesión sospechosa, cambia tu contraseña inmediatamente.
        </p>
      </div>
    </div>
  )
}
