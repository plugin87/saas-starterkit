import type { Metadata } from 'next'
import { Tag } from 'lucide-react'

import {
  Card,
  CardContent,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'โปรโมชั่น | สมาชิก',
}

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">โปรโมชั่นสำหรับคุณ</h1>
        <p className="text-muted-foreground">โปรโมชั่นและสิทธิพิเศษสำหรับสมาชิก</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Tag className="h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-xl font-semibold mb-2">เร็วๆ นี้</h2>
          <p className="text-muted-foreground text-center max-w-md">
            เรากำลังเตรียมโปรโมชั่นสุดพิเศษสำหรับสมาชิกอยู่ กรุณารอติดตามนะคะ
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
