import type { Metadata } from 'next'
import Link from 'next/link'
import { CreditCard, Star, ShoppingBag } from 'lucide-react'

import { getMyProfile, getMyPurchases } from '@/actions/profile'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'
import { TierBadge } from '@/components/shared/tier-badge'
import { TierProgress } from '@/components/member/tier-progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'หน้าหลัก | สมาชิก',
}

const paymentLabels: Record<string, string> = {
  cash: 'เงินสด',
  card: 'บัตรเครดิต',
  transfer: 'โอนเงิน',
  qr: 'QR Code',
}

export default async function MemberHomePage() {
  const [profileResult, purchasesResult] = await Promise.all([
    getMyProfile(),
    getMyPurchases(1, 5),
  ])

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    )
  }

  const profile = profileResult.data
  const purchases = purchasesResult.data ?? []
  const purchaseCount = purchasesResult.count

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          สวัสดี, {profile.name ?? 'สมาชิก'}
        </h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับกลับมาที่ร้านหนังสือ
        </p>
      </div>

      {/* Tier Card */}
      <Card>
        <CardHeader>
          <CardTitle>ระดับสมาชิกของคุณ</CardTitle>
          <CardDescription>รหัสสมาชิก: {profile.member_code ?? '-'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <TierBadge tier={profile.membership_tier} className="text-base px-4 py-1" />
            <div className="text-right ml-auto">
              <p className="text-sm text-muted-foreground">คะแนนที่ใช้ได้</p>
              <p className="text-2xl font-bold">{formatPoints(profile.available_points)}</p>
            </div>
          </div>

          <Separator />

          {/* Tier Progress */}
          <div>
            <p className="text-sm font-medium mb-2">ความคืบหน้าระดับสมาชิก</p>
            <TierProgress
              currentTier={profile.membership_tier}
              totalSpent={profile.total_spent}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยอดซื้อสะสม</p>
              <p className="text-xl font-bold">{formatCurrency(profile.total_spent)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">คะแนนคงเหลือ</p>
              <p className="text-xl font-bold">{formatPoints(profile.available_points)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-lg bg-green-500/10 p-3">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">จำนวนครั้งที่ซื้อ</p>
              <p className="text-xl font-bold">{purchaseCount} ครั้ง</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>การซื้อล่าสุด</CardTitle>
            <CardDescription>5 รายการล่าสุด</CardDescription>
          </div>
          {purchaseCount > 5 && (
            <Link
              href="/member/history"
              className="text-sm text-primary hover:underline"
            >
              ดูทั้งหมด
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              ยังไม่มีประวัติการซื้อ
            </p>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase: Record<string, unknown>) => {
                const items = (purchase.purchase_items as Array<Record<string, unknown>>) ?? []
                const itemCount = items.reduce(
                  (sum: number, item: Record<string, unknown>) => sum + (item.quantity as number),
                  0
                )
                return (
                  <div
                    key={purchase.id as string}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {formatDate(purchase.created_at as string)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {itemCount} เล่ม
                        {' / '}
                        {paymentLabels[(purchase.payment_method as string)] ?? purchase.payment_method}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">
                        {formatCurrency(purchase.total as number)}
                      </p>
                      {(purchase.points_earned as number) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{purchase.points_earned as number} คะแนน
                        </Badge>
                      )}
                    </div>
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
