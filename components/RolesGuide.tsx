'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, X, Info } from 'lucide-react'
import { ROLE_DEFINITIONS, PERMISSION_CATEGORIES, PERMISSION_LABELS, type Role } from '@/lib/permissions'

export default function RolesGuide() {
  const [expandedRole, setExpandedRole] = useState<Role | null>('owner')
  const [showFullMatrix, setShowFullMatrix] = useState(false)

  const roles = Object.values(ROLE_DEFINITIONS)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-2">
            Guía de Roles y Permisos
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Consulta los permisos de cada rol antes de asignar usuarios
          </p>
        </div>
        <button
          onClick={() => setShowFullMatrix(!showFullMatrix)}
          className="btn-secondary text-sm"
        >
          {showFullMatrix ? 'Vista Simple' : 'Ver Matriz Completa'}
        </button>
      </div>

      {showFullMatrix ? (
        /* Full Permission Matrix */
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-3 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Permiso
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="text-center p-3 text-sm font-semibold"
                    style={{ color: role.color }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{role.icon}</span>
                      <span>{role.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                <>
                  <tr key={`category-${categoryKey}`} className="bg-[var(--color-surface)]/50">
                    <td
                      colSpan={roles.length + 1}
                      className="p-3 text-sm font-semibold text-[var(--color-textPrimary)]"
                    >
                      {category.name}
                    </td>
                  </tr>
                  {category.permissions.map((permission) => (
                    <tr
                      key={permission}
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]/30"
                    >
                      <td className="p-3 text-sm text-[var(--color-textSecondary)]">
                        {PERMISSION_LABELS[permission]}
                      </td>
                      {roles.map((role) => (
                        <td key={`${role.id}-${permission}`} className="text-center p-3">
                          {role.permissions.includes(permission) ? (
                            <Check className="inline text-[var(--color-success)]" size={18} />
                          ) : (
                            <X className="inline text-[var(--color-textSecondary)]/30" size={18} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Simple Role Cards */
        <div className="space-y-3">
          {roles.map((role) => {
            const isExpanded = expandedRole === role.id

            return (
              <div
                key={role.id}
                className="card border-2 hover:border-[var(--color-primary)]/20 transition-colors"
              >
                {/* Role Header */}
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: `${role.color}20`,
                        color: role.color,
                      }}
                    >
                      {role.icon}
                    </div>
                    <div className="text-left">
                      <h4
                        className="font-semibold text-base mb-1"
                        style={{ color: role.color }}
                      >
                        {role.name}
                        {role.id === 'owner' && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            No asignable
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-[var(--color-textSecondary)]">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[var(--color-textSecondary)]">
                        {role.permissions.length} permisos
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-[var(--color-textSecondary)]" size={20} />
                    ) : (
                      <ChevronDown className="text-[var(--color-textSecondary)]" size={20} />
                    )}
                  </div>
                </button>

                {/* Expanded Permissions */}
                {isExpanded && (
                  <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface)]/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
                        const categoryPermissions = category.permissions.filter((p) =>
                          role.permissions.includes(p)
                        )

                        if (categoryPermissions.length === 0) return null

                        return (
                          <div key={categoryKey}>
                            <h5 className="text-sm font-semibold text-[var(--color-textPrimary)] mb-2">
                              {category.name}
                            </h5>
                            <ul className="space-y-1.5">
                              {categoryPermissions.map((permission) => (
                                <li
                                  key={permission}
                                  className="flex items-start gap-2 text-sm text-[var(--color-textSecondary)]"
                                >
                                  <Check
                                    className="text-[var(--color-success)] flex-shrink-0 mt-0.5"
                                    size={16}
                                  />
                                  <span>{PERMISSION_LABELS[permission]}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="card bg-[var(--color-info)]/5 border-[var(--color-info)]/20">
        <div className="flex items-start gap-3">
          <Info className="text-[var(--color-info)] flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-[var(--color-textSecondary)]">
            <p className="font-semibold text-[var(--color-textPrimary)] mb-1">
              Importante sobre roles:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Solo el propietario puede gestionar usuarios y asignar roles</li>
              <li>El rol de propietario no puede ser asignado a otros usuarios</li>
              <li>Los usuarios pueden ser actualizados o removidos en cualquier momento</li>
              <li>Las invitaciones expiran después de 7 días</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
