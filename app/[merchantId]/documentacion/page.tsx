import { BookOpen } from 'lucide-react'
import DocumentacionClient from './DocumentacionClient'

export default async function DocumentacionPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return (
    <div className="container-dashboard py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] rounded-xl">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-textPrimary)]">
            Documentación API
          </h1>
          <p className="text-[var(--color-textSecondary)]">
            Guías y referencias para integrar DeonPay en tu aplicación
          </p>
        </div>
      </div>

      <DocumentacionClient merchantId={merchantId} />
    </div>
  )
}
