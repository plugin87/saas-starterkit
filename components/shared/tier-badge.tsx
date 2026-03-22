import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const tierConfig = {
  silver: { label: 'ซิลเวอร์', className: 'bg-gray-200 text-gray-800 hover:bg-gray-200' },
  gold: { label: 'โกลด์', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
  platinum: { label: 'แพลทินัม', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
}

interface TierBadgeProps {
  tier: string
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier as keyof typeof tierConfig] ?? tierConfig.silver
  return (
    <Badge className={cn(config.className, className)} variant="secondary">
      {config.label}
    </Badge>
  )
}
