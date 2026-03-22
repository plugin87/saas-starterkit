import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageOpen } from 'lucide-react'

interface LowStockBook {
  id: string
  title: string
  author: string
  stock_quantity: number
  low_stock_threshold: number
}

interface LowStockAlertProps {
  data: LowStockBook[]
}

export function LowStockAlert({ data }: LowStockAlertProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>แจ้งเตือนสต็อกต่ำ</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ไม่มีหนังสือที่สต็อกต่ำ
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((book) => (
              <Link
                key={book.id}
                href={`/admin/books/${book.id}`}
                className="flex items-center justify-between gap-3 rounded-md p-1 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  <Badge
                    variant={book.stock_quantity === 0 ? 'destructive' : 'secondary'}
                    className={
                      book.stock_quantity === 0
                        ? ''
                        : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                    }
                  >
                    เหลือ {book.stock_quantity} เล่ม
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    แจ้งเตือนที่ {book.low_stock_threshold} เล่ม
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
