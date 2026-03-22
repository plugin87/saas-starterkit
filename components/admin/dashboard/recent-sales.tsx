import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface SaleItem {
  id: string
  total: number
  points_earned: number
  payment_method: string
  created_at: string
  member: { name: string; member_code: string } | { name: string; member_code: string }[] | null
  staff: { name: string } | { name: string }[] | null
}

interface RecentSalesProps {
  data: SaleItem[]
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'เงินสด',
  card: 'บัตรเครดิต',
  transfer: 'โอนเงิน',
  qr: 'QR Code',
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'เมื่อสักครู่'
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function RecentSales({ data }: RecentSalesProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>การขายล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีรายการขาย</p>
        ) : (
          <div className="space-y-4">
            {data.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {(Array.isArray(sale.member) ? sale.member[0]?.name : sale.member?.name) ?? 'ลูกค้าทั่วไป'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {paymentMethodLabels[sale.payment_method] ?? sale.payment_method}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(sale.created_at)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(sale.total)}
                  </p>
                  {sale.points_earned > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +{sale.points_earned} คะแนน
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
