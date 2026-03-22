import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

const activities = [
  { user: 'Alice Johnson', action: 'Upgraded to Pro plan', time: new Date('2024-07-15T10:00:00') },
  { user: 'Bob Smith', action: 'Signed up for free plan', time: new Date('2024-07-14T14:30:00') },
  { user: 'Carol White', action: 'Cancelled subscription', time: new Date('2024-07-13T09:15:00') },
  { user: 'Dan Brown', action: 'Upgraded to Team plan', time: new Date('2024-07-12T16:45:00') },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions across your platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {item.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.user}</p>
              <p className="text-xs text-muted-foreground">{item.action}</p>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(item.time)}
            </time>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
