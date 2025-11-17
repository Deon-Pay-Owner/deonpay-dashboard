import ClientesClient from './ClientesClient'

export default async function ClientesPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return <ClientesClient merchantId={merchantId} />
}
