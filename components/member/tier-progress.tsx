import { Progress } from '@/components/ui/progress'
import { TierBadge } from '@/components/shared/tier-badge'
import { formatCurrency } from '@/lib/utils'

interface TierProgressProps {
  currentTier: string
  totalSpent: number
}

const tiers = [
  { id: 'silver', min: 0, next: 'gold', nextMin: 5000 },
  { id: 'gold', min: 5000, next: 'platinum', nextMin: 20000 },
  { id: 'platinum', min: 20000, next: null, nextMin: null },
]

export function TierProgress({ currentTier, totalSpent }: TierProgressProps) {
  const tier = tiers.find(t => t.id === currentTier) ?? tiers[0]

  if (!tier.next) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <TierBadge tier={currentTier} />
          <span className="text-sm text-muted-foreground">ระดับสูงสุดแล้ว</span>
        </div>
        <Progress value={100} />
      </div>
    )
  }

  const progress = Math.min(100, (totalSpent / tier.nextMin!) * 100)
  const remaining = Math.max(0, tier.nextMin! - totalSpent)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <TierBadge tier={currentTier} />
        <span className="text-sm text-muted-foreground">
          อีก {formatCurrency(remaining)} เลื่อนเป็น <TierBadge tier={tier.next} />
        </span>
      </div>
      <Progress value={progress} />
      <p className="text-xs text-muted-foreground text-right">
        {formatCurrency(totalSpent)} / {formatCurrency(tier.nextMin!)}
      </p>
    </div>
  )
}
