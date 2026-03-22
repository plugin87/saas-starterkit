import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react'
import type { StatsCard } from '@/types'

const stats: StatsCard[] = [
  { title: 'Total Revenue', value: '$12,450', change: 12.5, changeLabel: 'from last month' },
  { title: 'Active Users', value: '2,340', change: 8.2, changeLabel: 'from last month' },
  { title: 'Conversion Rate', value: '3.6%', change: -1.4, changeLabel: 'from last month' },
  { title: 'Active Now', value: '48', change: 5.0, changeLabel: 'from last hour' },
]

const icons = [DollarSign, Users, TrendingUp, Activity]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = icons[i]
        const isPositive = (stat.change ?? 0) >= 0
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== undefined && (
                <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
                  {isPositive ? '+' : ''}{stat.change}% {stat.changeLabel}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
