import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Banknote, BookOpen, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  totalMembers: number
  revenueToday: number
  booksSoldToday: number
  lowStockCount: number
}

export function StatsCards({ totalMembers, revenueToday, booksSoldToday, lowStockCount }: StatsCardsProps) {
  const cards = [
    {
      title: 'สมาชิกทั้งหมด',
      value: `${totalMembers.toLocaleString('th-TH')} คน`,
      icon: Users,
      iconColor: 'text-blue-500',
    },
    {
      title: 'รายได้วันนี้',
      value: formatCurrency(revenueToday),
      icon: Banknote,
      iconColor: 'text-green-500',
    },
    {
      title: 'หนังสือขายวันนี้',
      value: `${booksSoldToday.toLocaleString('th-TH')} เล่ม`,
      icon: BookOpen,
      iconColor: 'text-purple-500',
    },
    {
      title: 'หนังสือใกล้หมด',
      value: `${lowStockCount.toLocaleString('th-TH')} รายการ`,
      icon: AlertTriangle,
      iconColor: lowStockCount > 0 ? 'text-red-500' : 'text-muted-foreground',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
