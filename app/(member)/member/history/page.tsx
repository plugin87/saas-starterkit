import type { Metadata } from 'next'
import { Receipt } from 'lucide-react'

import { getMyPurchases } from '@/actions/profile'
import { formatCurrency, formatDate } from '@/lib/utils'
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
  title: 'ประวัติการซื้อ | สมาชิก',
}

const paymentLabels: Record<string, string> = {
  cash: 'เงินสด',
  card: 'บัตรเครดิต',
  transfer: 'โอนเงิน',
  qr: 'QR Code',
}

export default async function PurchaseHistoryPage() {
  const { data: purchases, error, count } = await getMyPurchases(1, 50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ประวัติการซื้อ</h1>
        <p className="text-muted-foreground">
          ประวัติการซื้อหนังสือทั้งหมดของคุณ ({count} รายการ)
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            เกิดข้อผิดพลาด: {error}
          </CardContent>
        </Card>
      )}

      {!error && (!purchases || purchases.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ยังไม่มีประวัติการซื้อ</p>
          </CardContent>
        </Card>
      )}

      {purchases && purchases.length > 0 && (
        <div className="space-y-4">
          {purchases.map((purchase: Record<string, unknown>) => {
            const items = (purchase.purchase_items as Array<Record<string, unknown>>) ?? []
            const totalItems = items.reduce(
              (sum: number, item: Record<string, unknown>) => sum + (item.quantity as number),
              0
            )

            return (
              <Card key={purchase.id as string}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {formatDate(purchase.created_at as string)}
                      </CardTitle>
                      <CardDescription>
                        {totalItems} เล่ม / {paymentLabels[(purchase.payment_method as string)] ?? purchase.payment_method}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(purchase.total as number)}
                      </p>
                      {(purchase.points_earned as number) > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{purchase.points_earned as number} คะแนน
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Purchase summary */}
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <div className="flex justify-between">
                      <span>ยอดรวม</span>
                      <span>{formatCurrency(purchase.subtotal as number)}</span>
                    </div>
                    {(purchase.discount_amount as number) > 0 && (
                      <div className="flex justify-between">
                        <span>ส่วนลดสมาชิก</span>
                        <span className="text-green-600">-{formatCurrency(purchase.discount_amount as number)}</span>
                      </div>
                    )}
                    {(purchase.points_discount as number) > 0 && (
                      <div className="flex justify-between">
                        <span>ส่วนลดจากคะแนน</span>
                        <span className="text-green-600">-{formatCurrency(purchase.points_discount as number)}</span>
                      </div>
                    )}
                    {(purchase.points_redeemed as number) > 0 && (
                      <div className="flex justify-between">
                        <span>คะแนนที่ใช้</span>
                        <span>-{purchase.points_redeemed as number} คะแนน</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-3" />

                  {/* Item list */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">รายการหนังสือ</p>
                    {items.map((item: Record<string, unknown>) => {
                      const book = item.books as Record<string, unknown> | null
                      return (
                        <div
                          key={item.id as string}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">
                              {book?.title as string ?? 'หนังสือที่ถูกลบ'}
                            </p>
                            {book?.author && (
                              <p className="text-xs text-muted-foreground truncate">
                                {book.author as string}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4 shrink-0">
                            <span className="text-muted-foreground">
                              {item.quantity as number} x {formatCurrency(item.unit_price as number)}
                            </span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(item.total as number)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
