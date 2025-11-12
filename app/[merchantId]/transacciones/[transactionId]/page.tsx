import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import TransactionDetailClient from './TransactionDetailClient'

export default async function TransactionDetailPage({
  params,
}: {
  params: { merchantId: string; transactionId: string }
}) {
  const supabase = await createClient()

  // Fetch payment intent with charges
  const { data: paymentIntent, error } = await supabase
    .from('payment_intents')
    .select(`
      *,
      charges (*)
    `)
    .eq('id', params.transactionId)
    .eq('merchant_id', params.merchantId)
    .single()

  if (error || !paymentIntent) {
    redirect(`/${params.merchantId}/transacciones`)
  }

  return (
    <TransactionDetailClient
      paymentIntent={paymentIntent}
      merchantId={params.merchantId}
    />
  )
}
