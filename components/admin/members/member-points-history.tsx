'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPoints } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

const typeLabels: Record<string, { label: string; className: string }> = {
  earn: { label: 'ได้รับ', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' },
  redeem: { label: 'แลก', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' },
  adjust: { label: 'ปรับ', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
  expire: { label: 'หมดอายุ', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' },
}

interface PointsTransaction {
  id: string
  type: string
  points: number
  balance_after: number
  description: string | null
  created_at: string
}

interface MemberPointsHistoryProps {
  memberId: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MemberPointsHistory({ memberId }: MemberPointsHistoryProps) {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('points_transactions')
        .select('id, type, points, balance_after, description, created_at')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(20)

      setTransactions(data ?? [])
      setIsLoading(false)
    }

    fetchHistory()
  }, [memberId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">กำลังโหลดประวัติคะแนน...</span>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <p>ยังไม่มีประวัติคะแนน</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_1fr] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
        <span>วันที่</span>
        <span>ประเภท</span>
        <span className="text-right">คะแนน</span>
        <span className="text-right">คงเหลือ</span>
        <span>รายละเอียด</span>
      </div>

      {/* Rows */}
      {transactions.map((tx) => {
        const config = typeLabels[tx.type] ?? typeLabels.adjust
        const isPositive = tx.points > 0

        return (
          <div
            key={tx.id}
            className="grid grid-cols-[auto_1fr_auto_auto_1fr] gap-3 items-center rounded-md px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
          >
            <span className="text-muted-foreground whitespace-nowrap text-xs">
              {formatDate(tx.created_at)}
            </span>

            <div>
              <Badge className={config.className} variant="secondary">
                {config.label}
              </Badge>
            </div>

            <span
              className={`text-right font-semibold tabular-nums ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {new Intl.NumberFormat('th-TH').format(tx.points)}
            </span>

            <span className="text-right text-muted-foreground tabular-nums">
              {new Intl.NumberFormat('th-TH').format(tx.balance_after)}
            </span>

            <span className="text-muted-foreground truncate text-xs">
              {tx.description || '-'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
