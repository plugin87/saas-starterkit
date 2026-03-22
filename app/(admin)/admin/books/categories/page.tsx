import { getCategories } from '@/actions/categories'
import { CategoryManager } from '@/components/admin/books/category-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'หมวดหมู่หนังสือ' }

export default async function CategoriesPage() {
  const { data: categories, flat } = await getCategories()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">หมวดหมู่หนังสือ</h1>
        <p className="text-muted-foreground">จัดการหมวดหมู่สำหรับจัดระเบียบหนังสือในร้าน</p>
      </div>
      <CategoryManager categories={categories ?? []} flatCategories={flat ?? []} />
    </div>
  )
}
