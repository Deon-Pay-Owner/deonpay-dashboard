import LinksClient from './LinksClient'

export default async function LinksPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return <LinksClient merchantId={merchantId} />
}
