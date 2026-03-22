import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function AdminLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
