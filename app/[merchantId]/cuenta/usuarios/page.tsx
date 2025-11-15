'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, UserPlus, Shield, Trash2, Edit2, Clock, CheckCircle2 } from 'lucide-react'
import RolesGuide from '@/components/RolesGuide'
import { ROLE_DEFINITIONS, getInvitableRoles, type Role } from '@/lib/permissions'

interface TeamMember {
  id: string
  user_id: string
  email: string
  role: Role
  status: string
  invited_at: string
  accepted_at: string | null
}

interface Invitation {
  id: string
  email: string
  role: Role
  status: string
  created_at: string
  expires_at: string
}

export default function UsuariosPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const [merchantId, setMerchantId] = useState<string>('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRolesGuide, setShowRolesGuide] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => {
      setMerchantId(p.merchantId)
      fetchData(p.merchantId)
    })
  }, [])

  const fetchData = async (mid: string) => {
    try {
      setLoading(true)

      // Fetch members
      const membersRes = await fetch(`/api/users?merchantId=${mid}`)
      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.members || [])
      }

      // Fetch invitations
      const invitesRes = await fetch(`/api/users/invite?merchantId=${mid}`)
      if (invitesRes.ok) {
        const data = await invitesRes.json()
        setInvitations(data.invitations || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError(null)

    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar invitación')
      }

      // Success
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('viewer')
      fetchData(merchantId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover a este usuario?')) {
      return
    }

    try {
      const res = await fetch(`/api/users/${userId}?merchantId=${merchantId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al remover usuario')
      }

      fetchData(merchantId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          role: newRole,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar rol')
      }

      fetchData(merchantId)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const invitableRoles = getInvitableRoles()

  if (loading) {
    return (
      <div className="container-dashboard pt-8 pb-4 sm:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--color-textSecondary)]">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2 flex items-center gap-3">
          <Users size={32} />
          Usuarios y Permisos
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Gestiona quién tiene acceso a tu dashboard y sus permisos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} />
          Invitar Usuario
        </button>
        <button
          onClick={() => setShowRolesGuide(!showRolesGuide)}
          className="btn-secondary flex items-center gap-2"
        >
          <Shield size={20} />
          {showRolesGuide ? 'Ocultar' : 'Ver'} Guía de Roles
        </button>
      </div>

      {/* Roles Guide */}
      {showRolesGuide && (
        <div className="mb-8">
          <RolesGuide />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Users size={20} />
            Miembros del Equipo ({members.length})
          </h2>

          {members.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-textSecondary)]">
              <Users size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
              <p>No hay miembros en el equipo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const roleInfo = ROLE_DEFINITIONS[member.role]
                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            backgroundColor: `${roleInfo.color}20`,
                            color: roleInfo.color,
                          }}
                        >
                          {roleInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-[var(--color-textPrimary)] truncate">
                              {member.email}
                            </h4>
                            {member.status === 'active' && (
                              <CheckCircle2
                                className="text-[var(--color-success)] flex-shrink-0"
                                size={16}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {member.role === 'owner' ? (
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{
                                  backgroundColor: `${roleInfo.color}20`,
                                  color: roleInfo.color,
                                }}
                              >
                                {roleInfo.name}
                              </span>
                            ) : (
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleUpdateRole(member.user_id, e.target.value as Role)
                                }
                                className="text-xs px-2 py-1 rounded-full font-medium border-0"
                                style={{
                                  backgroundColor: `${roleInfo.color}20`,
                                  color: roleInfo.color,
                                }}
                              >
                                {invitableRoles.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                            Unido el {new Date(member.accepted_at || member.invited_at).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>

                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="p-2 rounded-lg hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)] transition-colors"
                          title="Remover usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pending Invitations */}
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Mail size={20} />
            Invitaciones Pendientes ({invitations.filter((i) => i.status === 'pending').length})
          </h2>

          {invitations.filter((i) => i.status === 'pending').length === 0 ? (
            <div className="text-center py-12 text-[var(--color-textSecondary)]">
              <Mail size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
              <p>No hay invitaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations
                .filter((i) => i.status === 'pending')
                .map((invitation) => {
                  const roleInfo = ROLE_DEFINITIONS[invitation.role]
                  const expiresAt = new Date(invitation.expires_at)
                  const isExpired = expiresAt < new Date()

                  return (
                    <div
                      key={invitation.id}
                      className="p-4 rounded-lg bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            backgroundColor: `${roleInfo.color}20`,
                            color: roleInfo.color,
                          }}
                        >
                          {roleInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--color-textPrimary)] truncate mb-1">
                            {invitation.email}
                          </h4>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium inline-block"
                            style={{
                              backgroundColor: `${roleInfo.color}20`,
                              color: roleInfo.color,
                            }}
                          >
                            {roleInfo.name}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={12} className="text-[var(--color-textSecondary)]" />
                            <p className="text-xs text-[var(--color-textSecondary)]">
                              {isExpired
                                ? 'Expirada'
                                : `Expira el ${expiresAt.toLocaleDateString('es-MX')}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="card max-w-md w-full">
            <h3 className="card-header">Invitar Nuevo Usuario</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-2">
                  Rol
                </label>
                <div className="space-y-2">
                  {invitableRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        checked={inviteRole === role.id}
                        onChange={(e) => setInviteRole(e.target.value as Role)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{role.icon}</span>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: role.color }}
                          >
                            {role.name}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-textSecondary)]">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                    setInviteRole('viewer')
                    setError(null)
                  }}
                  className="btn-secondary flex-1"
                  disabled={inviting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={inviting}
                >
                  {inviting ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
