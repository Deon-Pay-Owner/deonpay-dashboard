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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
          <p className="text-gray-600">
            Gestiona tu base de clientes y su información
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Total de clientes</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Clientes activos</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Nuevos este mes</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Customers List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Teléfono
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Transacciones
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Total gastado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Última compra
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <UsersIcon size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium mb-2">
                    No hay clientes registrados
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
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
      </div>
    </div>
  )
}
