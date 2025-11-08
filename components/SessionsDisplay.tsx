'use client'

import { Monitor, Smartphone, Tablet, MapPin, Clock } from 'lucide-react'

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

export default function SessionsDisplay({ sessions }: SessionsDisplayProps) {
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
      <h2 className="card-header flex items-center gap-2">
        <Clock size={20} />
        Historial de sesiones
      </h2>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--color-textSecondary)]">
            No hay sesiones registradas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
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
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Si ves alguna sesión sospechosa, cambia tu contraseña inmediatamente.
        </p>
      </div>
    </div>
  )
}
