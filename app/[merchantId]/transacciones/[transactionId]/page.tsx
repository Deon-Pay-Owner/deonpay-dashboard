import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import TransactionDetailClient from './TransactionDetailClient'

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ merchantId: string; transactionId: string }>
}) {
  const { merchantId, transactionId } = await params
  const supabase = await createClient()

  // Fetch payment intent with charges
  const { data: paymentIntent, error } = await supabase
    .from('payment_intents')
    .select(`
      *,
      charges (*)
    `)
    .eq('id', transactionId)
    .eq('merchant_id', merchantId)
    .single()

  if (error || !paymentIntent) {
    redirect(`/${merchantId}/transacciones`)
  }

  return (
    <TransactionDetailClient
      paymentIntent={paymentIntent}
      merchantId={merchantId}
    />
  )
}
