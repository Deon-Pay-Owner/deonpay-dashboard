import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default async function PaymentLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ urlKey: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { urlKey } = await params
  const search = await searchParams
  const supabase = await createClient()

  // Fetch the payment link
  const { data: paymentLink, error: linkError } = await supabase
    .from('payment_links')
    .select('*')
    .eq('url_key', urlKey)
    .eq('active', true)
    .single()

  if (linkError || !paymentLink) {
    console.error('Payment link not found:', linkError)
    notFound()
  }

  // Increment click analytics
  await supabase.rpc('increment_payment_link_stats', {
    p_link_id: paymentLink.id,
    p_event_type: 'click'
  })

  // Parse line items
  const lineItems = paymentLink.line_items as Array<{
    product_id: string
    quantity: number
    price_data?: any
  }>

  if (!lineItems || lineItems.length === 0) {
    console.error('Payment link has no line items')
    notFound()
  }

  // Get product information for line items
  const productIds = lineItems.map(item => item.product_id).filter(Boolean)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (!products || products.length === 0) {
    console.error('No products found for line items')
    notFound()
  }

  // Calculate total amount
  let totalAmount = 0
  const sessionLineItems = lineItems.map(item => {
    const product = products.find(p => p.id === item.product_id)
    if (!product) return null

    const itemAmount = product.unit_amount * (item.quantity || 1)
    totalAmount += itemAmount

    return {
      product_id: product.id,
      quantity: item.quantity || 1,
      amount_subtotal: itemAmount,
      amount_total: itemAmount,
      amount_tax: 0,
      amount_discount: 0,
      name: product.name,
      description: product.description,
      images: product.images || [],
      price_data: {
        unit_amount: product.unit_amount,
        currency: product.currency
      }
    }
  }).filter(Boolean)

  // Create a checkout session
  const { data: checkoutSession, error: sessionError } = await supabase
    .from('checkout_sessions')
    .insert({
      merchant_id: paymentLink.merchant_id,
      mode: paymentLink.type === 'subscription' ? 'subscription' : 'payment',
      status: 'open',
      currency: paymentLink.currency,
      amount_total: totalAmount,
      amount_subtotal: totalAmount,
      success_url: paymentLink.after_completion_url || `${process.env.NEXT_PUBLIC_APP_URL || 'https://checkout.deonpay.mx'}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://checkout.deonpay.mx'}/link/${urlKey}`,
      billing_address_collection: paymentLink.billing_address_collection || 'auto',
      shipping_address_collection: paymentLink.shipping_address_collection,
      allow_promotion_codes: paymentLink.allow_promotion_codes || false,
      metadata: {
        payment_link_id: paymentLink.id,
        ...search
      }
    })
    .select()
    .single()

  if (sessionError || !checkoutSession) {
    console.error('Error creating checkout session:', sessionError)
    throw new Error('Failed to create checkout session')
  }

  // Insert line items
  if (sessionLineItems.length > 0) {
    const { error: lineItemsError } = await supabase
      .from('checkout_line_items')
      .insert(
        sessionLineItems.map(item => ({
          checkout_session_id: checkoutSession.id,
          ...item
        }))
      )

    if (lineItemsError) {
      console.error('Error creating line items:', lineItemsError)
    }
  }

  // Track analytics
  await supabase
    .from('payment_link_analytics')
    .insert({
      payment_link_id: paymentLink.id,
      event_type: 'checkout_started',
      checkout_session_id: checkoutSession.id,
      session_id: checkoutSession.url_key
    })

  // Redirect to checkout page
  redirect(`/checkout/${checkoutSession.url_key}`)
}
