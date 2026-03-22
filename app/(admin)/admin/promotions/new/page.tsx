import { PromotionForm } from '@/components/admin/promotions/promotion-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'สร้างโปรโมชั่นใหม่' }

export default function NewPromotionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สร้างโปรโมชั่นใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลโปรโมชั่นที่ต้องการสร้าง</p>
      </div>
      <PromotionForm />
    </div>
  )
}
