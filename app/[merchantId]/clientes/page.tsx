import { Search, UserPlus, Users as UsersIcon } from 'lucide-react'

export default async function ClientesPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return (
    <div className="container-dashboard py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">Clientes</h1>
          <p className="text-[var(--color-textSecondary)]">
            Gestiona tu base de clientes y su información
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)] pointer-events-none z-10"
          />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="input-field pl-11 w-full"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Total de clientes</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Clientes activos</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Nuevos este mes</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">0</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden sm:table-cell">
                  Teléfono
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">
                  Transacciones
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Total gastado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">
                  Última compra
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <UsersIcon size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
                  <p className="text-[var(--color-textSecondary)] font-medium mb-2">
                    No hay clientes registrados
                  </p>
                  <p className="text-sm text-[var(--color-textSecondary)] opacity-70 mb-4">
                    Los clientes se crearán automáticamente con cada transacción
                  </p>
                  <button className="btn-primary mx-auto">
                    Crear primer cliente
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-textSecondary)] mt-3 md:hidden">
          💡 Cambia a modo landscape para ver todas las columnas
        </p>
      </div>
    </div>
  )
}
