'use client'

import { useState, useEffect } from 'react'
import { X, Link2, Package, Plus, CheckCircle2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  unit_amount: number
  currency: string
  active: boolean
  type?: 'one_time' | 'recurring'
  recurring_interval?: string
  recurring_interval_count?: number
}

interface PaymentLink {
  id: string
  active: boolean
  custom_url?: string
  after_completion_url?: string
  after_completion_message?: string
  billing_address_collection: string
  phone_number_collection: boolean
  allow_promotion_codes: boolean
}

interface CreateLinkModalProps {
  merchantId: string
  onClose: () => void
  onSuccess: () => void
  link?: PaymentLink | null
}

export default function CreateLinkModal({
  merchantId,
  onClose,
  onSuccess,
  link
}: CreateLinkModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select')
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [productError, setProductError] = useState('')

  const [formData, setFormData] = useState({
    product_id: '',
    custom_url: link?.custom_url || '',
    after_completion_url: link?.after_completion_url || '',
    after_completion_message: link?.after_completion_message || '',
    billing_address_collection: link?.billing_address_collection || 'auto',
    phone_number_collection: link?.phone_number_collection || false,
    allow_promotion_codes: link?.allow_promotion_codes || false,
    active: link?.active !== undefined ? link.active : true,
  })

  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    unit_amount: '',
    currency: 'MXN',
    type: 'one_time' as 'one_time' | 'recurring',
    recurring_interval: 'month',
    recurring_interval_count: '1',
    active: true,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/merchant/${merchantId}/products?active=true&limit=100`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleCreateProduct = async () => {
    if (!newProductData.name || !newProductData.unit_amount) {
      setProductError('Por favor completa los campos requeridos')
      return
    }

    setCreatingProduct(true)
    setProductError('')

    try {
      const amountInCents = Math.round(parseFloat(newProductData.unit_amount) * 100)

      const payload: any = {
        name: newProductData.name,
        description: newProductData.description || undefined,
        unit_amount: amountInCents,
        currency: newProductData.currency,
        type: newProductData.type,
        active: newProductData.active,
      }

      if (newProductData.type === 'recurring') {
        payload.recurring_interval = newProductData.recurring_interval
        payload.recurring_interval_count = parseInt(newProductData.recurring_interval_count)
      }

      const response = await fetch(`/api/merchant/${merchantId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Error al crear el producto')
      }

      const result = await response.json()

      // Add product to list and select it
      setProducts([result, ...products])
      setFormData({ ...formData, product_id: result.id })

      // Switch to select tab to show the newly created product
      setActiveTab('select')

      // Reset new product form
      setNewProductData({
        name: '',
        description: '',
        unit_amount: '',
        currency: 'MXN',
        type: 'one_time',
        recurring_interval: 'month',
        recurring_interval_count: '1',
        active: true,
      })
    } catch (err: any) {
      setProductError(err.message || 'Error al crear el producto')
    } finally {
      setCreatingProduct(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id) {
      alert('Por favor selecciona un producto')
      return
    }

    setLoading(true)

    try {
      const url = link
        ? `/api/merchant/${merchantId}/payment-links/${link.id}`
        : `/api/merchant/${merchantId}/payment-links`

      const response = await fetch(url, {
        method: link ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment link')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating payment link:', error)
      alert(error instanceof Error ? error.message : 'Error al crear el link de pago')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {link ? 'Editar Link de Pago' : 'Crear Nuevo Link de Pago'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection/Creation Tabs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Producto *
            </label>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('select')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'select'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Package size={16} />
                  Seleccionar Producto
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Crear Producto
                </div>
              </button>
            </div>

            {/* Tab Content: Select Product */}
            {activeTab === 'select' && (
              <div>
                {loadingProducts ? (
                  <div className="text-sm text-slate-500">Cargando productos...</div>
                ) : products.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <p className="text-sm text-slate-500 mb-2">
                      No hay productos disponibles.
                    </p>
                    <p className="text-xs text-slate-400">
                      Crea tu primer producto usando la pestaña "Crear Producto"
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.unit_amount, product.currency)}
                      </option>
                    ))}
                  </select>
                )}

                {selectedProduct && (
                  <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          {selectedProduct.name}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {selectedProduct.description || 'Sin descripción'}
                        </p>
                        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-2">
                          {formatPrice(selectedProduct.unit_amount, selectedProduct.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Create Product */}
            {activeTab === 'create' && (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {productError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{productError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newProductData.name}
                    onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                    placeholder="Ej: Plan Pro Mensual"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newProductData.description}
                    onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                    placeholder="Describe tu producto"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProductData.unit_amount}
                      onChange={(e) => setNewProductData({ ...newProductData, unit_amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Moneda
                    </label>
                    <select
                      value={newProductData.currency}
                      onChange={(e) => setNewProductData({ ...newProductData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tipo de producto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newProductData.type === 'one_time'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      onClick={() => setNewProductData({ ...newProductData, type: 'one_time' })}
                    >
                      <div className="text-sm font-medium">Pago único</div>
                    </button>

                    <button
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newProductData.type === 'recurring'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                      onClick={() => setNewProductData({ ...newProductData, type: 'recurring' })}
                    >
                      <div className="text-sm font-medium">Suscripción</div>
                    </button>
                  </div>
                </div>

                {newProductData.type === 'recurring' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Intervalo
                      </label>
                      <select
                        value={newProductData.recurring_interval}
                        onChange={(e) => setNewProductData({ ...newProductData, recurring_interval: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="day">Día</option>
                        <option value="week">Semana</option>
                        <option value="month">Mes</option>
                        <option value="year">Año</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newProductData.recurring_interval_count}
                        onChange={(e) => setNewProductData({ ...newProductData, recurring_interval_count: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCreateProduct}
                  disabled={creatingProduct}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {creatingProduct ? 'Creando producto...' : 'Crear y Seleccionar Producto'}
                </button>
              </div>
            )}
          </div>

          {/* Custom URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL Personalizada (opcional)
            </label>
            <input
              type="text"
              value={formData.custom_url}
              onChange={(e) => setFormData({ ...formData, custom_url: e.target.value })}
              placeholder="mi-producto-especial"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Si no se especifica, se generará una URL aleatoria
            </p>
          </div>

          {/* After Completion */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL de Redirección (opcional)
            </label>
            <input
              type="url"
              value={formData.after_completion_url}
              onChange={(e) => setFormData({ ...formData, after_completion_url: e.target.value })}
              placeholder="https://tusitio.com/gracias"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              URL a la que se redirigirá al cliente después del pago
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mensaje de Confirmación (opcional)
            </label>
            <textarea
              value={formData.after_completion_message}
              onChange={(e) => setFormData({ ...formData, after_completion_message: e.target.value })}
              placeholder="¡Gracias por tu compra!"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Configuración
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Recolección de Dirección
              </label>
              <select
                value={formData.billing_address_collection}
                onChange={(e) => setFormData({ ...formData, billing_address_collection: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="auto">Automático</option>
                <option value="required">Requerido</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.phone_number_collection}
                onChange={(e) => setFormData({ ...formData, phone_number_collection: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Solicitar número de teléfono
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_promotion_codes}
                onChange={(e) => setFormData({ ...formData, allow_promotion_codes: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Permitir códigos promocionales
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Activar link inmediatamente
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.product_id}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : link ? 'Actualizar Link' : 'Crear Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
