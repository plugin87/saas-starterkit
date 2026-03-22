import { getBooks } from '@/actions/books'
import { getCategories } from '@/actions/categories'
import { BookTable } from '@/components/admin/books/book-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'คลังหนังสือ' }

export default async function BooksPage() {
  const { data: books } = await getBooks()
  const { flat: categories } = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">คลังหนังสือ</h1>
          <p className="text-muted-foreground">จัดการหนังสือทั้งหมดในร้าน</p>
        </div>
        <Link href="/admin/books/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มหนังสือใหม่
          </Button>
        </Link>
      </div>
      <BookTable data={books ?? []} categories={categories ?? []} />
    </div>
  )
}
