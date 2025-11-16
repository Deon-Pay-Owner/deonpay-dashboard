'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Package,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import CreateProductModal from './CreateProductModal'
import CreatePaymentLinkModal from './CreatePaymentLinkModal'

interface Product {
  id: string
  name: string
  description?: string
  unit_amount: number
  currency: string
  type: 'one_time' | 'recurring'
  recurring_interval?: string
  recurring_interval_count?: number
  active: boolean
  images?: string[]
  created_at: string
}

export default function ProductosClient({ merchantId }: { merchantId: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchProducts()
  }, [merchantId, activeFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Get the merchant's API key from cookies
      const apiKey = document.cookie
        .split('; ')
        .find(row => row.startsWith('deonpay_api_key='))
        ?.split('=')[1]

      if (!apiKey) {
        console.error('No API key found')
        setProducts([])
        return
      }

      // Build query params
      const params = new URLSearchParams({
        merchant_id: merchantId,
        limit: '100',
      })

      if (activeFilter === 'active') {
        params.append('active', 'true')
      } else if (activeFilter === 'inactive') {
        params.append('active', 'false')
      }

      const response = await fetch(`https://api.deonpay.mx/api/v1/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`)
      }

      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  const formatRecurring = (product: Product) => {
    if (product.type !== 'recurring') return 'Pago único'

    const interval = product.recurring_interval
    const count = product.recurring_interval_count || 1

    const intervalText: { [key: string]: string } = {
      day: count === 1 ? 'día' : 'días',
      week: count === 1 ? 'semana' : 'semanas',
      month: count === 1 ? 'mes' : 'meses',
      year: count === 1 ? 'año' : 'años',
    }

    return `Cada ${count > 1 ? count + ' ' : ''}${intervalText[interval || 'month']}`
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'active' && product.active) ||
                         (activeFilter === 'inactive' && !product.active)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    recurring: products.filter(p => p.type === 'recurring').length,
  }

  return (
    <div className="container-dashboard pt-8 pb-4 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] mb-2">Productos</h1>
          <p className="text-[var(--color-textSecondary)]">
            Gestiona tu catálogo de productos y servicios
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Nuevo Producto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)] pointer-events-none z-10"
            />
            <input
              type="text"
              placeholder="Buscar productos por nombre o descripción..."
              className="input-field pl-11 w-full"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)]'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'active'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)]'
              }`}
              onClick={() => setActiveFilter('active')}
            >
              Activos
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'inactive'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)]'
              }`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactivos
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Total de productos</p>
          <p className="text-3xl font-bold text-[var(--color-textPrimary)]">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Productos activos</p>
          <p className="text-3xl font-bold text-[var(--color-success)]">{stats.active}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--color-textSecondary)] mb-2">Suscripciones</p>
          <p className="text-3xl font-bold text-[var(--color-info)]">{stats.recurring}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="card">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            <p className="text-[var(--color-textSecondary)] mt-4">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={48} className="mx-auto mb-4 text-[var(--color-border)]" />
            <p className="text-[var(--color-textSecondary)] font-medium mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] opacity-70 mb-4">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Crea tu primer producto para empezar a vender'
              }
            </p>
            {!searchTerm && (
              <button
                className="btn-primary mx-auto"
                onClick={() => setShowCreateModal(true)}
              >
                Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={48} className="text-white/50" />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {product.active ? (
                      <span className="px-2 py-1 bg-[var(--color-success)] text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Eye size={12} />
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-[var(--color-textSecondary)] text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <EyeOff size={12} />
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[var(--color-textPrimary)] mb-1 truncate">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-[var(--color-textSecondary)] mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-2xl font-bold text-[var(--color-textPrimary)]">
                      {formatPrice(product.unit_amount, product.currency)}
                    </span>
                    <span className="text-xs text-[var(--color-textSecondary)]">
                      {formatRecurring(product)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-[var(--color-border)]">
                    <button
                      className="flex-1 px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm font-medium"
                      onClick={() => {
                        setSelectedProduct(product)
                        setShowPaymentLinkModal(true)
                      }}
                    >
                      <LinkIcon size={14} />
                      Crear Link
                    </button>
                    <button
                      className="px-3 py-2 bg-[var(--color-surface)] text-[var(--color-textPrimary)] rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="px-3 py-2 bg-[var(--color-surface)] text-[var(--color-error)] rounded-lg hover:bg-[var(--color-surfaceHover)] transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProductModal
          merchantId={merchantId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProducts()
          }}
        />
      )}

      {showPaymentLinkModal && selectedProduct && (
        <CreatePaymentLinkModal
          merchantId={merchantId}
          product={selectedProduct}
          onClose={() => {
            setShowPaymentLinkModal(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setShowPaymentLinkModal(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}