import { BookOpen } from 'lucide-react'
import DocumentacionClient from './DocumentacionClient'

export default async function DocumentacionPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = await params

  return (
    <div className="container-dashboard pt-6 sm:pt-8 pb-8 px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-info)] rounded-lg sm:rounded-xl flex-shrink-0">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-textPrimary)] truncate">
            Documentación API
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-textSecondary)] line-clamp-2">
            Guías y referencias para integrar DeonPay en tu aplicación
          </p>
        </div>
      </div>

      <DocumentacionClient merchantId={merchantId} />
    </div>
  )
}
