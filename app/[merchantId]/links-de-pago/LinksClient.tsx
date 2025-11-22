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
import CreateLinkModal from './CreateLinkModalV2'
import { paymentLinks as paymentLinksAPI } from '@/lib/api-client'

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
      const params: { limit?: number; active?: boolean } = {
        limit: 100
      }

      if (activeFilter === 'active') {
        params.active = true
      } else if (activeFilter === 'inactive') {
        params.active = false
      }

      const { data, error } = await paymentLinksAPI.list(params)

      if (error) {
        throw new Error(error.message || 'Failed to fetch payment links')
      }

      setPaymentLinks(data || [])
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
      const { error } = await paymentLinksAPI.update(link.id, {
        active: !link.active,
      })

      if (error) {
        throw new Error(error.message || 'Failed to update payment link')
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
      const { error } = await paymentLinksAPI.delete(linkId)

      if (error) {
        throw new Error(error.message || 'Failed to delete payment link')
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                Links de Pago
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Crea y gestiona links de pago para tus productos
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Link</span>
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

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                activeFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setActiveFilter('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
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
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
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
                    <div className="flex items-start sm:items-center gap-2 mb-4">
                      <code className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-1 rounded break-all overflow-hidden flex-1 min-w-0">
                        {link.url}
                      </code>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => copyToClipboard(link.url, link.id)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          title="Copiar link"
                        >
                          {copiedId === link.id ? (
                            <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">✓</span>
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
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {link.click_count} clics
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {link.completed_sessions_count} conversiones
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {getConversionRate(link)}% conversión
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 sm:flex-col sm:gap-1">
                    <button
                      onClick={() => toggleLinkStatus(link)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title={link.active ? 'Desactivar' : 'Activar'}
                    >
                      {link.active ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
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
