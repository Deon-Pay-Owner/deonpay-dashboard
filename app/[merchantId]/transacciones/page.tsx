import TransaccionesClient from './TransaccionesClient'

export default async function TransaccionesPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return <TransaccionesClient merchantId={merchantId} />
}
