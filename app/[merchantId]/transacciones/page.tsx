import { Search, Filter, Download, CreditCard } from 'lucide-react'

export default async function TransaccionesPage({
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transacciones
          </h1>
          <p className="text-gray-600">
            Historial completo de todas tus transacciones
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download size={18} />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, email..."
              className="input-field pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium mb-2">
                    No hay transacciones aún
                  </p>
                  <p className="text-sm text-gray-400">
                    Las transacciones aparecerán aquí cuando proceses tu primer pago
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Example of what the table would look like with data */}
      <div className="mt-8 card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Vista previa con datos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-sm font-mono text-gray-600">
                  txn_123abc
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  2025-11-06 10:30
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  Juan Pérez
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                  $1,250.00 MXN
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Exitoso
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  Tarjeta •••• 4242
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
