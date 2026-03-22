import { getPromotions } from '@/actions/promotions'
import { PromotionTable } from '@/components/admin/promotions/promotion-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'โปรโมชั่น' }

export default async function PromotionsPage() {
  const { data: promotions } = await getPromotions({})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">โปรโมชั่น</h1>
          <p className="text-muted-foreground">จัดการโปรโมชั่นและสิทธิพิเศษทั้งหมด</p>
        </div>
        <Link href="/admin/promotions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            สร้างโปรโมชั่น
          </Button>
        </Link>
      </div>
      <PromotionTable data={promotions ?? []} />
    </div>
  )
}
