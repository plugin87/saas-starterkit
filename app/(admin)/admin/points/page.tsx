import { getPointsHistory } from '@/actions/points'
import { PointsAdjustForm } from '@/components/admin/points/points-adjust-form'
import { PointsHistoryTable } from '@/components/admin/points/points-history-table'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'จัดการคะแนน' }

export default async function PointsPage() {
  const { data: transactions } = await getPointsHistory({ pageSize: 50 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">จัดการคะแนน</h1>
        <p className="text-muted-foreground">
          ปรับคะแนนสมาชิกด้วยมือ และดูประวัติคะแนนทั้งหมด
        </p>
      </div>

      <PointsAdjustForm />

      <div>
        <h2 className="text-xl font-semibold mb-4">ประวัติคะแนนล่าสุด</h2>
        <PointsHistoryTable data={transactions ?? []} />
      </div>
    </div>
  )
}
