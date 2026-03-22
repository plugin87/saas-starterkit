import { getMember, getMemberStats } from '@/actions/members'
import { MemberForm } from '@/components/admin/members/member-form'
import { MemberPointsHistory } from '@/components/admin/members/member-points-history'
import { TierBadge } from '@/components/shared/tier-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'รายละเอียดสมาชิก' }

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: member } = await getMember(id)
  if (!member) notFound()

  const stats = await getMemberStats(id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">รายละเอียดสมาชิก</h1>
        <p className="text-muted-foreground">{member.name || 'ไม่ระบุชื่อ'}</p>
      </div>

      {/* สถิติสมาชิก */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสมาชิก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              {member.member_code || '-'}
            </span>
            <TierBadge tier={member.membership_tier} />
            {member.is_active ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
                ใช้งาน
              </Badge>
            ) : (
              <Badge variant="destructive">ระงับ</Badge>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm text-muted-foreground">ยอดซื้อสะสม</p>
              <p className="text-lg font-bold">
                {formatCurrency(member.total_spent ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm text-muted-foreground">คะแนนคงเหลือ</p>
              <p className="text-lg font-bold">
                {formatPoints(member.available_points ?? 0)}
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-sm text-muted-foreground">จำนวนครั้งที่ซื้อ</p>
              <p className="text-lg font-bold">{stats.purchaseCount} ครั้ง</p>
            </div>
          </div>

          {/* การซื้อล่าสุด */}
          {stats.recentPurchases.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">การซื้อล่าสุด</p>
              <div className="space-y-1">
                {stats.recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(purchase.created_at)}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(purchase.total)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      +{purchase.points_earned} คะแนน
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ประวัติคะแนน */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติคะแนน</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberPointsHistory memberId={id} />
        </CardContent>
      </Card>

      {/* ฟอร์มแก้ไข */}
      <MemberForm initialData={member} />
    </div>
  )
}
