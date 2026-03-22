import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function MemberLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}
