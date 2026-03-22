import { getCategories } from '@/actions/categories'
import { BookForm } from '@/components/admin/books/book-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'เพิ่มหนังสือใหม่' }

export default async function NewBookPage() {
  const { flat: categories } = await getCategories()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มหนังสือใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลหนังสือที่ต้องการเพิ่มเข้าคลัง</p>
      </div>
      <BookForm categories={categories ?? []} />
    </div>
  )
}
