import ProductosClient from './ProductosClient'

export default async function ProductosPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return <ProductosClient merchantId={merchantId} />
}