import { createClient } from '@/lib/supabase'
import { Building2, User, Mail, Phone, IdCard } from 'lucide-react'
import AccountForm from '../general/AccountForm'
import DeleteAccountButton from '../general/DeleteAccountButton'
import SessionsDisplay from '@/components/SessionsDisplay'
import ChangePasswordForm from '@/components/ChangePasswordForm'

export default async function CuentaPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get merchant info
  const { data: merchant } = await supabase
    .from('merchants')
    .select('name, country, currency, channel, status, onboarding_stage, created_at')
    .eq('id', merchantId)
    .single()

  // Get user profile
  const { data: profile } = await supabase
    .from('users_profile')
    .select('full_name, phone, profile_type')
    .eq('user_id', user?.id)
    .single()

  // Get user sessions from last week only
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: sessions } = await supabase
    .from('session_logs')
    .select('id, login_at, logout_at, ip_address, device_type, browser, os, country, city, is_active')
    .eq('user_id', user?.id)
    .gte('login_at', oneWeekAgo.toISOString())
    .order('login_at', { ascending: false })

  const PROFILE_TYPE_LABELS = {
    merchant_owner: 'Dueño de negocio',
    developer: 'Desarrollador',
    agency: 'Agencia',
  }

  return (
    <div className="container-dashboard pt-6 pb-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
          Configuración de cuenta
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Administra la información de tu comercio y perfil personal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Merchant Information Card */}
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <Building2 size={20} />
            Información del comercio
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Nombre del comercio
              </label>
              <p className="text-[var(--color-textPrimary)] font-medium">
                {merchant?.name || 'No especificado'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                  País
                </label>
                <p className="text-[var(--color-textPrimary)]">
                  {merchant?.country || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                  Moneda
                </label>
                <p className="text-[var(--color-textPrimary)]">
                  {merchant?.currency || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                  Canal
                </label>
                <p className="text-[var(--color-textPrimary)]">
                  {merchant?.channel?.replace(/_/g, ' ') || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                  Estado
                </label>
                <span className={`
                  inline-block px-2 py-1 rounded-full text-xs font-medium
                  ${merchant?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }
                `}>
                  {merchant?.status === 'active' ? 'Activo' : 'Borrador'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Merchant ID
              </label>
              <div className="bg-[var(--color-surface)] p-2 rounded font-mono text-sm text-[var(--color-textPrimary)] break-all">
                {merchantId}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-textSecondary)] block mb-1">
                Fecha de creación
              </label>
              <p className="text-[var(--color-textPrimary)]">
                {merchant?.created_at
                  ? new Date(merchant.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'No disponible'
                }
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Information */}
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <User size={20} />
            Información personal
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-lg">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <User size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-textSecondary)]">Nombre completo</p>
                <p className="font-medium text-[var(--color-textPrimary)]">
                  {profile?.full_name || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-lg">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Mail size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-textSecondary)]">Correo electrónico</p>
                <p className="font-medium text-[var(--color-textPrimary)]">
                  {user?.email || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-lg">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Phone size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-textSecondary)]">Teléfono</p>
                <p className="font-medium text-[var(--color-textPrimary)]">
                  {profile?.phone || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] rounded-lg">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <IdCard size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-textSecondary)]">Tipo de perfil</p>
                <p className="font-medium text-[var(--color-textPrimary)]">
                  {profile?.profile_type
                    ? PROFILE_TYPE_LABELS[profile.profile_type as keyof typeof PROFILE_TYPE_LABELS]
                    : 'No especificado'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Account Form and Change Password - Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Editable Account Form */}
        {user && profile && (
          <AccountForm
            merchantId={merchantId}
            merchantName={merchant?.name || ''}
            fullName={profile.full_name || ''}
            phone={profile.phone || ''}
            email={user.email || ''}
            profileType={profile.profile_type || 'merchant_owner'}
          />
        )}

        {/* Change Password */}
        <ChangePasswordForm />
      </div>

      {/* Sessions Display - Full Width */}
      <div className="mb-8">
        <SessionsDisplay sessions={sessions || []} />
      </div>

      {/* Delete Account Section - Danger Zone */}
      {user?.email && (
        <DeleteAccountButton userEmail={user.email} />
      )}
    </div>
  )
}
