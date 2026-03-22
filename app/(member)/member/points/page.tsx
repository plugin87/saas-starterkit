import type { Metadata } from 'next'
import { Star, Info } from 'lucide-react'

import { getMyProfile, getMyPoints } from '@/actions/profile'
import { formatPoints, formatDate } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'คะแนนสะสม | สมาชิก',
}

const typeLabels: Record<string, string> = {
  earn: 'ได้รับ',
  redeem: 'แลก',
  adjust: 'ปรับ',
  expire: 'หมดอายุ',
}

const typeColors: Record<string, string> = {
  earn: 'bg-green-100 text-green-800 hover:bg-green-100',
  redeem: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  adjust: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  expire: 'bg-red-100 text-red-800 hover:bg-red-100',
}

export default async function PointsPage() {
  const [profileResult, pointsResult] = await Promise.all([
    getMyProfile(),
    getMyPoints(1, 50),
  ])

  const profile = profileResult.data
  const transactions = pointsResult.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">คะแนนสะสม</h1>
        <p className="text-muted-foreground">ดูคะแนนสะสมและประวัติการใช้คะแนนของคุณ</p>
      </div>

      {/* Points summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-lg bg-yellow-500/10 p-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">คะแนนที่ใช้ได้</p>
              <p className="text-3xl font-bold">
                {profile ? formatPoints(profile.available_points) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">อัตราแลกคะแนน</p>
              <p className="text-xl font-bold">100 คะแนน = 5 บาท</p>
              <p className="text-xs text-muted-foreground mt-1">
                สามารถใช้คะแนนแลกส่วนลดในครั้งถัดไป
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติคะแนน</CardTitle>
          <CardDescription>
            รายการเคลื่อนไหวคะแนนทั้งหมด ({pointsResult.count} รายการ)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีประวัติคะแนน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: Record<string, unknown>) => {
                const points = tx.points as number
                const isPositive = points > 0
                const txType = tx.type as string

                return (
                  <div key={tx.id as string}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={typeColors[txType] ?? ''}
                        >
                          {typeLabels[txType] ?? txType}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {(tx.description as string) ?? '-'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.created_at as string)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}{points} คะแนน
                        </p>
                        <p className="text-xs text-muted-foreground">
                          คงเหลือ {tx.balance_after as number} คะแนน
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
