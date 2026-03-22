'use server'

import { createClient } from '@/utils/supabase/server'
import { bookSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getBooks({
  search,
  categoryId,
  stockStatus,
  page = 1,
  pageSize = 20,
}: {
  search?: string
  categoryId?: string
  stockStatus?: 'all' | 'low' | 'out'
  page?: number
  pageSize?: number
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('books')
    .select('*, book_categories(id, name)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (stockStatus === 'low') {
    query = query.lte('stock_quantity', 5) // will use low_stock_threshold later
    query = query.gt('stock_quantity', 0)
  } else if (stockStatus === 'out') {
    query = query.eq('stock_quantity', 0)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function getBook(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*, book_categories(id, name)')
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createBook(formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    isbn: (formData.get('isbn') as string) || undefined,
    publisher: (formData.get('publisher') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    price: Number(formData.get('price')),
    costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
    stockQuantity: Number(formData.get('stockQuantity') || 0),
    lowStockThreshold: Number(formData.get('lowStockThreshold') || 5),
  }

  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const categoryId = formData.get('categoryId') as string
  const coverImageUrl = formData.get('coverImageUrl') as string
  const tags = formData.get('tags') as string

  const { data, error } = await supabase
    .from('books')
    .insert({
      title: parsed.data.title,
      author: parsed.data.author,
      isbn: parsed.data.isbn || null,
      publisher: parsed.data.publisher || null,
      description: parsed.data.description || null,
      price: parsed.data.price,
      cost_price: raw.costPrice || null,
      stock_quantity: parsed.data.stockQuantity,
      low_stock_threshold: parsed.data.lowStockThreshold,
      category_id: categoryId || null,
      cover_image_url: coverImageUrl || null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/books')
  return { data, error: null }
}

export async function updateBook(id: string, formData: FormData) {
  const raw = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    isbn: (formData.get('isbn') as string) || undefined,
    publisher: (formData.get('publisher') as string) || undefined,
    description: (formData.get('description') as string) || undefined,
    price: Number(formData.get('price')),
    costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
    stockQuantity: Number(formData.get('stockQuantity') || 0),
    lowStockThreshold: Number(formData.get('lowStockThreshold') || 5),
  }

  const parsed = bookSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const categoryId = formData.get('categoryId') as string
  const coverImageUrl = formData.get('coverImageUrl') as string
  const tags = formData.get('tags') as string

  const { error } = await supabase
    .from('books')
    .update({
      title: parsed.data.title,
      author: parsed.data.author,
      isbn: parsed.data.isbn || null,
      publisher: parsed.data.publisher || null,
      description: parsed.data.description || null,
      price: parsed.data.price,
      cost_price: raw.costPrice || null,
      stock_quantity: parsed.data.stockQuantity,
      low_stock_threshold: parsed.data.lowStockThreshold,
      category_id: categoryId || null,
      cover_image_url: coverImageUrl || null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/books')
  revalidatePath(`/admin/books/${id}`)
  return { error: null }
}

export async function updateStock(id: string, quantity: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('books')
    .update({ stock_quantity: quantity })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/books')
  return { error: null }
}

export async function deactivateBook(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('books')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/books')
  return { error: null }
}

export async function getLowStockBooks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('low_stock_books')
    .select('*')
    .limit(20)

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function uploadBookCover(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'ไม่พบไฟล์', url: null }

  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage
    .from('book-covers')
    .upload(fileName, file)

  if (error) return { error: error.message, url: null }

  const { data: { publicUrl } } = supabase.storage
    .from('book-covers')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}
