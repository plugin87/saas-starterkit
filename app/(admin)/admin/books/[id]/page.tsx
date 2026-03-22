import { getBook } from '@/actions/books'
import { getCategories } from '@/actions/categories'
import { BookForm } from '@/components/admin/books/book-form'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'แก้ไขหนังสือ' }

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: book } = await getBook(id)
  if (!book) notFound()

  const { flat: categories } = await getCategories()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขหนังสือ</h1>
        <p className="text-muted-foreground">{book.title}</p>
      </div>
      <BookForm initialData={book} categories={categories ?? []} />
    </div>
  )
}
