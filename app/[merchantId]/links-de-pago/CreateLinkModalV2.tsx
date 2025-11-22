'use client'

import { useState, useEffect } from 'react'
import { X, Link2, Package, Plus, DollarSign, Calendar, Users } from 'lucide-react'
import { products as productsAPI, paymentLinks as paymentLinksAPI } from '@/lib/api-client'

interface Product {
  id: string
  name: string
  description?: string
  unit_amount: number
  currency: string
  active: boolean
}

interface CreateLinkModalProps {
  merchantId: string
  onClose: () => void
  onSuccess: () => void
}

type LinkMode = 'select_product' | 'create_product' | 'amount_only'

export default function CreateLinkModalV2({
  merchantId,
  onClose,
  onSuccess,
}: CreateLinkModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [activeMode, setActiveMode] = useState<LinkMode>('select_product')
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    // Product selection
    product_id: '',

    // Quick product creation
    quick_product_name: '',
    quick_product_price: '',
    quick_product_description: '',

    // Amount-only mode
    amount_only_price: '',

    // Link configuration
    internal_name: '',
    public_description: '',
    mode: 'fixed_amount' as 'fixed_amount' | 'customer_chooses',
    currency: 'MXN',

    // URLs
    success_url: '',
    cancel_url: '',
    custom_url: '',

    // Collection settings
    collect_email: true,
    collect_name: true,
    collect_phone: false,

    // Restrictions
    max_uses: '',
    expires_at: '',

    // Other settings
    active: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await productsAPI.list({ active: true, limit: 100 })
      if (error) throw new Error(error.message)
      setProducts(data?.data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let productId = formData.product_id

      // STEP 1: Create quick product if needed
      if (activeMode === 'create_product') {
        if (!formData.quick_product_name || !formData.quick_product_price) {
          throw new Error('Por favor completa el nombre y precio del producto')
        }

        const { data: newProduct, error: productError } = await productsAPI.create({
          name: formData.quick_product_name,
          description: formData.quick_product_description,
          unit_amount: Math.round(parseFloat(formData.quick_product_price) * 100),
          currency: formData.currency,
          type: 'one_time',
          active: true,
        })

        if (productError) throw new Error(productError.message)
        productId = newProduct.id
      }

      // STEP 2: Build payment link payload
      const payload: any = {
        currency: formData.currency,
        active: formData.active,
        custom_url: formData.custom_url || undefined,

        // Collection settings
        phone_number_collection: formData.collect_phone,

        // After completion
        after_completion: formData.success_url ? {
          type: 'redirect' as const,
          redirect: { url: formData.success_url }
        } : undefined,

        // Restrictions
        restrictions: formData.max_uses ? {
          completed_sessions: {
            enabled: true,
            limit: parseInt(formData.max_uses)
          }
        } : undefined,

        // Metadata
        metadata: {
          internal_name: formData.internal_name,
          public_description: formData.public_description,
          mode: formData.mode,
          collect_email: formData.collect_email,
          collect_name: formData.collect_name,
          cancel_url: formData.cancel_url || undefined,
          expires_at: formData.expires_at || undefined,
        }
      }

      // STEP 3: Add line_items OR amount depending on mode
      if (activeMode === 'amount_only') {
        // Amount-only mode: no product, store amount in metadata
        if (!formData.amount_only_price) {
          throw new Error('Por favor ingresa un monto')
        }
        payload.line_items = [] // Empty line items
        payload.metadata.amount = Math.round(parseFloat(formData.amount_only_price) * 100)
      } else {
        // Product mode: add line_items
        if (!productId) {
          throw new Error('Por favor selecciona un producto')
        }
        payload.line_items = [{
          type: 'product',
          product_id: productId,
          quantity: 1
        }]
      }

      // STEP 4: Create payment link
      const { data: result, error: linkError } = await paymentLinksAPI.create(payload)

      if (linkError) {
        throw new Error(linkError.message || 'Error al crear el link de pago')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear el link de pago')
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white">
              Crear Link de Pago
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
              Tipo de Link *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveMode('select_product')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'select_product'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                }`}
              >
                <Package className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <div className="text-xs sm:text-sm font-medium">Producto Existente</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('create_product')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'create_product'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                }`}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                <div className="text-xs sm:text-sm font-medium">Crear Producto</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('amount_only')}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'amount_only'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                }`}
              >
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-purple-600" />
                <div className="text-xs sm:text-sm font-medium">Solo Monto</div>
              </button>
            </div>
          </div>

          {/* Mode-specific content */}
          {activeMode === 'select_product' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Seleccionar Producto *
              </label>
              {loadingProducts ? (
                <div className="text-sm text-slate-500">Cargando productos...</div>
              ) : products.length === 0 ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-sm text-slate-500">No hay productos disponibles</p>
                </div>
              ) : (
                <>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required={activeMode === 'select_product'}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.unit_amount, product.currency)}
                      </option>
                    ))}
                  </select>
                  {selectedProduct && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        {selectedProduct.description || 'Sin descripción'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeMode === 'create_product' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={formData.quick_product_name}
                  onChange={(e) => setFormData({ ...formData, quick_product_name: e.target.value })}
                  placeholder="Ej: Plan Pro Mensual"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  required={activeMode === 'create_product'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.quick_product_description}
                  onChange={(e) => setFormData({ ...formData, quick_product_description: e.target.value })}
                  placeholder="Describe tu producto"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quick_product_price}
                    onChange={(e) => setFormData({ ...formData, quick_product_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required={activeMode === 'create_product'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'amount_only' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount_only_price}
                    onChange={(e) => setFormData({ ...formData, amount_only_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    required={activeMode === 'amount_only'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Modo de Pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'fixed_amount' })}
                    className={`p-3 rounded-lg border-2 ${
                      formData.mode === 'fixed_amount'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium">Monto Fijo</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'customer_chooses' })}
                    className={`p-3 rounded-lg border-2 ${
                      formData.mode === 'customer_chooses'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <div className="text-sm font-medium">Cliente Elige</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Link Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Detalles del Link
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre Interno
              </label>
              <input
                type="text"
                value={formData.internal_name}
                onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                placeholder="Ej: Promo Black Friday 2024"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
              <p className="text-xs text-slate-500 mt-1">Solo visible para ti en el dashboard</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Descripción Pública
              </label>
              <textarea
                value={formData.public_description}
                onChange={(e) => setFormData({ ...formData, public_description: e.target.value })}
                placeholder="Descripción que verán tus clientes"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL Personalizada (opcional)
              </label>
              <input
                type="text"
                value={formData.custom_url}
                onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
                placeholder="mi-producto-especial"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              URLs de Redirección
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL de Éxito
              </label>
              <input
                type="url"
                value={formData.success_url}
                onChange={(e) => setFormData({ ...formData, success_url: e.target.value })}
                placeholder="https://tusitio.com/gracias"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL de Cancelación
              </label>
              <input
                type="url"
                value={formData.cancel_url}
                onChange={(e) => setFormData({ ...formData, cancel_url: e.target.value })}
                placeholder="https://tusitio.com/cancelado"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          {/* Collection Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Información del Cliente
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.collect_email}
                  onChange={(e) => setFormData({ ...formData, collect_email: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Solicitar Email</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.collect_name}
                  onChange={(e) => setFormData({ ...formData, collect_name: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Solicitar Nombre</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.collect_phone}
                  onChange={(e) => setFormData({ ...formData, collect_phone: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Solicitar Teléfono</span>
              </label>
            </div>
          </div>

          {/* Restrictions */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Restricciones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Usos Máximos
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Fecha de Expiración
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">Activar link inmediatamente</span>
          </label>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
            >
              {loading ? 'Creando...' : 'Crear Link de Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
