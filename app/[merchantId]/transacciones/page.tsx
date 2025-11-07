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
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">
            Transacciones
          </h1>
          <p className="text-[var(--color-textSecondary)]">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]"
            />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, email..."
              className="input-field pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <CreditCard size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
                  <p className="text-[var(--color-textSecondary)] font-medium mb-2">
                    No hay transacciones aún
                  </p>
                  <p className="text-sm text-[var(--color-textSecondary)] opacity-70">
                    Las transacciones aparecerán aquí cuando proceses tu primer pago
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Example of what the table would look like with data */}
      <div className="mt-8 card bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
        <h3 className="text-sm font-semibold text-[var(--color-textPrimary)] mb-4">
          Vista previa con datos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  Método
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)] opacity-60">
                <td className="py-3 px-4 text-sm font-mono text-[var(--color-textSecondary)]">
                  txn_123abc
                </td>
                <td className="py-3 px-4 text-sm text-[var(--color-textSecondary)]">
                  2025-11-06 10:30
                </td>
                <td className="py-3 px-4 text-sm text-[var(--color-textPrimary)]">
                  Juan Pérez
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-[var(--color-textPrimary)]">
                  $1,250.00 MXN
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-success)]/20 text-[var(--color-success)]">
                    Exitoso
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-[var(--color-textSecondary)]">
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
