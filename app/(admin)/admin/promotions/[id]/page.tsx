import { getPromotion } from '@/actions/promotions'
import { PromotionForm } from '@/components/admin/promotions/promotion-form'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'แก้ไขโปรโมชั่น' }

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: promotion } = await getPromotion(id)
  if (!promotion) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขโปรโมชั่น</h1>
        <p className="text-muted-foreground">{promotion.name}</p>
      </div>
      <PromotionForm initialData={promotion} />
    </div>
  )
}
