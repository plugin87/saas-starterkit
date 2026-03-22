import type { Metadata } from 'next'
import Image from 'next/image'
import { Tag, BookOpen } from 'lucide-react'

import { getPromotionsForMember, getMemberRecommendations } from '@/actions/promotions'
import { getMyProfile } from '@/actions/profile'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'โปรโมชั่น | สมาชิก',
}

const typeLabels: Record<string, string> = {
  percent_discount: 'ลดเปอร์เซ็นต์',
  fixed_discount: 'ลดราคาคงที่',
  buy_x_get_y: 'ซื้อ X แถม Y',
  spend_threshold: 'ซื้อครบ X ได้ Y',
  bundle: 'ชุดหนังสือ',
  points_multiplier: 'คูณคะแนน',
}

const typeBadgeColors: Record<string, string> = {
  percent_discount: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  fixed_discount: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  buy_x_get_y: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  spend_threshold: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  bundle: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  points_multiplier: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default async function MemberPromotionsPage() {
  const profileResult = await getMyProfile()

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    )
  }

  const memberId = profileResult.data.id

  const [promotionsResult, recommendationsResult] = await Promise.all([
    getPromotionsForMember(memberId),
    getMemberRecommendations(memberId),
  ])

  const promotions = promotionsResult.data ?? []
  const recommendations = recommendationsResult.data ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">โปรโมชั่นสำหรับคุณ</h1>
        <p className="text-muted-foreground">โปรโมชั่นและสิทธิพิเศษสำหรับสมาชิก</p>
      </div>

      {/* โปรโมชั่นสำหรับคุณ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">โปรโมชั่นสำหรับคุณ</h2>
        {promotions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ไม่มีโปรโมชั่นในขณะนี้</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {promotions.map((promo: Record<string, unknown>) => {
              const promoType = promo.type as string
              return (
                <Card key={promo.id as string}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {promo.name as string}
                        </CardTitle>
                        {promo.description && (
                          <CardDescription>
                            {promo.description as string}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        className={typeBadgeColors[promoType] ?? ''}
                        variant="secondary"
                      >
                        {typeLabels[promoType] ?? promoType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {formatDate(promo.starts_at as string)} - {formatDate(promo.ends_at as string)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* แนะนำสำหรับคุณ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">แนะนำสำหรับคุณ</h2>
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">ยังไม่มีหนังสือแนะนำ</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {recommendations.map((book: Record<string, unknown>) => (
              <Card key={book.id as string} className="overflow-hidden">
                <div className="relative aspect-[2/3] w-full bg-muted">
                  {book.cover_image_url ? (
                    <Image
                      src={book.cover_image_url as string}
                      alt={book.title as string}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1 p-3">
                  <p className="text-sm font-medium leading-tight line-clamp-2">
                    {book.title as string}
                  </p>
                  {book.author && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {book.author as string}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(book.price as number)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
