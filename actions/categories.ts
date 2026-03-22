'use server'

import { createClient } from '@/utils/supabase/server'
import { categorySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('book_categories')
    .select('*')
    .order('name')

  if (error) return { error: error.message, data: null }

  // Build tree structure from flat list
  const map = new Map<string, any>()
  const roots: any[] = []

  // First pass: create map
  for (const cat of data) {
    map.set(cat.id, { ...cat, children: [] })
  }

  // Second pass: build tree
  for (const cat of data) {
    const node = map.get(cat.id)!
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return { data: roots, flat: data, error: null }
}

export async function createCategory(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || undefined,
  }

  const parsed = categorySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const parentId = formData.get('parentId') as string

  const { data, error } = await supabase
    .from('book_categories')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      parent_id: parentId || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/books/categories')
  revalidatePath('/admin/books')
  return { data, error: null }
}

export async function updateCategory(id: string, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || undefined,
  }

  const parsed = categorySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const parentId = formData.get('parentId') as string

  const { error } = await supabase
    .from('book_categories')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      parent_id: parentId || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/books/categories')
  revalidatePath('/admin/books')
  return { error: null }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Check if category has books
  const { count } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    return { error: `ไม่สามารถลบได้ มีหนังสือในหมวดหมู่นี้ ${count} เล่ม` }
  }

  // Move children to parent's parent (or root)
  const { data: cat } = await supabase
    .from('book_categories')
    .select('parent_id')
    .eq('id', id)
    .single()

  await supabase
    .from('book_categories')
    .update({ parent_id: cat?.parent_id || null })
    .eq('parent_id', id)

  const { error } = await supabase
    .from('book_categories')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/books/categories')
  return { error: null }
}
