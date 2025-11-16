'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Link2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  QrCode,
  ExternalLink,
  Eye,
  EyeOff,
  TrendingUp
} from 'lucide-react'
import CreateLinkModal from './CreateLinkModal'

interface PaymentLink {
  id: string
  merchant_id: string
  active: boolean
  type: 'payment' | 'subscription'
  line_items: Array<{
    product_id: string
    quantity: number
  }>
  url_key: string
  custom_url?: string
  after_completion_url?: string
  after_completion_message?: string
  currency: string
  allow_promotion_codes: boolean
  billing_address_collection: string
  phone_number_collection: boolean
  click_count: number
  completed_sessions_count: number
  created_at: string
  url: string
  products?: {
    id: string
    name: string
    unit_amount: number
    currency: string
  }
}

export default function LinksClient({ merchantId }: { merchantId: string }) {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentLinks()
  }, [merchantId, activeFilter])

  const fetchPaymentLinks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
      })

      if (activeFilter === 'active') {
        params.append('active', 'true')
      } else if (activeFilter === 'inactive') {
        params.append('active', 'false')
      }

      const response = await fetch(`/api/merchant/${merchantId}/payment-links?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch payment links: ${response.statusText}`)
      }

      const data = await response.json()
      setPaymentLinks(data.data || [])
    } catch (error) {
      console.error('Error fetching payment links:', error)
      setPaymentLinks([])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const toggleLinkStatus = async (link: PaymentLink) => {
    try {
      const response = await fetch(`/api/merchant/${merchantId}/payment-links/${link.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !link.active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment link')
      }

      await fetchPaymentLinks()
    } catch (error) {
      console.error('Error updating payment link:', error)
      alert('Error al actualizar el link de pago')
    }
  }

  const deleteLink = async (linkId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este link de pago?')) {
      return
    }

    try {
      const response = await fetch(`/api/merchant/${merchantId}/payment-links/${linkId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete payment link')
      }

      await fetchPaymentLinks()
    } catch (error) {
      console.error('Error deleting payment link:', error)
      alert('Error al eliminar el link de pago')
    }
  }

  const getConversionRate = (link: PaymentLink) => {
    if (link.click_count === 0) return 0
    return ((link.completed_sessions_count / link.click_count) * 100).toFixed(1)
  }

  const filteredLinks = paymentLinks.filter(link => {
    const productName = link.products?.name || ''
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.url_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.custom_url?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                Links de Pago
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Crea y gestiona links de pago para tus productos
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Crear Link
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar links de pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {/* Payment Links List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando links de pago...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <Link2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No hay links de pago
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm
                ? 'No se encontraron links que coincidan con tu búsqueda'
                : 'Crea tu primer link de pago para empezar a vender'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Link de Pago
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLinks.map((link) => (
              <div
                key={link.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {link.products?.name || 'Link de Pago'}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          link.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {link.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* URL */}
                    <div className="flex items-center gap-2 mb-4">
                      <code className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">
                        {link.url}
                      </code>
                      <button
                        onClick={() => copyToClipboard(link.url, link.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Copiar link"
                      >
                        {copiedId === link.id ? (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Copiado</span>
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {link.click_count} clics
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {link.completed_sessions_count} conversiones
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          {getConversionRate(link)}% tasa de conversión
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLinkStatus(link)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title={link.active ? 'Desactivar' : 'Activar'}
                    >
                      {link.active ? (
                        <EyeOff className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          merchantId={merchantId}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedLink(null)
          }}
          onSuccess={() => {
            fetchPaymentLinks()
            setShowCreateModal(false)
            setSelectedLink(null)
          }}
          link={selectedLink}
        />
      )}
    </div>
  )
}
