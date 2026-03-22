import { getSalesHistory } from '@/actions/sales'
import { SalesHistoryTable } from '@/components/admin/sales/sales-history-table'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'ประวัติการขาย' }

export default async function SalesHistoryPage() {
  const { data: sales, count } = await getSalesHistory()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการขาย</h1>
          <p className="text-muted-foreground">
            รายการขายทั้งหมด {count} รายการ
          </p>
        </div>
        <Link href="/admin/sales">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            บันทึกการขาย
          </Button>
        </Link>
      </div>
      <SalesHistoryTable data={sales ?? []} />
    </div>
  )
}
