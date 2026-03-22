'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPromotions({
  status,
  page = 1,
  pageSize = 20,
}: {
  status?: 'active' | 'upcoming' | 'expired' | 'all'
  page?: number
  pageSize?: number
} = {}) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('promotions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status === 'active') {
    query = query.eq('is_active', true).lte('starts_at', now).gte('ends_at', now)
  } else if (status === 'upcoming') {
    query = query.eq('is_active', true).gt('starts_at', now)
  } else if (status === 'expired') {
    query = query.or(`is_active.eq.false,ends_at.lt.${now}`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function getPromotion(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('promotions')
    .select(`
      *,
      promotion_books(book_id, books(id, title, author))
    `)
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createPromotion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const type = formData.get('type') as string
  const configStr = formData.get('config') as string
  const minTier = (formData.get('minTier') as string) || null
  const startsAt = formData.get('startsAt') as string
  const endsAt = formData.get('endsAt') as string
  const maxUses = formData.get('maxUses') ? Number(formData.get('maxUses')) : null
  const bookIds = formData.get('bookIds') as string // comma-separated

  if (!name) return { error: 'กรุณากรอกชื่อโปรโมชั่น' }
  if (!type) return { error: 'กรุณาเลือกประเภทโปรโมชั่น' }
  if (!startsAt || !endsAt) return { error: 'กรุณากำหนดวันเริ่มต้นและสิ้นสุด' }

  let config = {}
  try {
    config = configStr ? JSON.parse(configStr) : {}
  } catch {
    return { error: 'รูปแบบ config ไม่ถูกต้อง' }
  }

  const { data: promotion, error } = await supabase
    .from('promotions')
    .insert({
      name,
      description,
      type,
      config,
      min_tier: minTier,
      starts_at: startsAt,
      ends_at: endsAt,
      max_uses: maxUses,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Link books if provided
  if (bookIds && promotion) {
    const ids = bookIds.split(',').map(id => id.trim()).filter(Boolean)
    if (ids.length > 0) {
      await supabase.from('promotion_books').insert(
        ids.map(bookId => ({ promotion_id: promotion.id, book_id: bookId }))
      )
    }
  }

  revalidatePath('/admin/promotions')
  return { data: promotion, error: null }
}

export async function updatePromotion(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const type = formData.get('type') as string
  const configStr = formData.get('config') as string
  const minTier = (formData.get('minTier') as string) || null
  const startsAt = formData.get('startsAt') as string
  const endsAt = formData.get('endsAt') as string
  const maxUses = formData.get('maxUses') ? Number(formData.get('maxUses')) : null
  const isActive = formData.get('isActive') === 'true'

  let config = {}
  try {
    config = configStr ? JSON.parse(configStr) : {}
  } catch {
    return { error: 'รูปแบบ config ไม่ถูกต้อง' }
  }

  const { error } = await supabase
    .from('promotions')
    .update({
      name,
      description,
      type,
      config,
      min_tier: minTier,
      starts_at: startsAt,
      ends_at: endsAt,
      max_uses: maxUses,
      is_active: isActive,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  // Update book links
  const bookIds = formData.get('bookIds') as string
  await supabase.from('promotion_books').delete().eq('promotion_id', id)
  if (bookIds) {
    const ids = bookIds.split(',').map(id => id.trim()).filter(Boolean)
    if (ids.length > 0) {
      await supabase.from('promotion_books').insert(
        ids.map(bookId => ({ promotion_id: id, book_id: bookId }))
      )
    }
  }

  revalidatePath('/admin/promotions')
  revalidatePath(`/admin/promotions/${id}`)
  return { error: null }
}

export async function deactivatePromotion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('promotions')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/promotions')
  return { error: null }
}

export async function getActivePromotions() {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at', { ascending: true })

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function getPromotionsForMember(memberId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Get member's tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('id', memberId)
    .single()

  if (!profile) return { data: [], error: null }

  const tierOrder = ['silver', 'gold', 'platinum']
  const memberTierIndex = tierOrder.indexOf(profile.membership_tier)

  // Get active promotions
  const { data: promos } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)

  // Filter by tier eligibility
  const eligible = (promos ?? []).filter(p => {
    if (!p.min_tier) return true
    const minIndex = tierOrder.indexOf(p.min_tier)
    return memberTierIndex >= minIndex
  })

  return { data: eligible, error: null }
}

export async function getBookRecommendations(bookId: string, limit = 5) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('book_pairs')
    .select(`
      book_a_id, book_b_id, co_purchase_count,
      book_a:books!book_pairs_book_a_id_fkey(id, title, author, price, cover_image_url),
      book_b:books!book_pairs_book_b_id_fkey(id, title, author, price, cover_image_url)
    `)
    .or(`book_a_id.eq.${bookId},book_b_id.eq.${bookId}`)
    .order('co_purchase_count', { ascending: false })
    .limit(limit)

  if (!data) return []

  return data.map(pair => {
    const recommended = pair.book_a_id === bookId ? pair.book_b : pair.book_a
    return { ...recommended, co_purchase_count: pair.co_purchase_count }
  })
}

export async function getMemberRecommendations(memberId: string, limit = 10) {
  const supabase = await createClient()

  // Get books the member has purchased
  const { data: memberItems } = await supabase
    .from('purchase_items')
    .select('book_id, purchases!inner(member_id)')
    .eq('purchases.member_id', memberId)

  if (!memberItems || memberItems.length === 0) return []

  const ownedBookIds = Array.from(new Set(memberItems.map(i => i.book_id)))

  // Get co-purchased books
  const { data: pairs } = await supabase
    .from('book_pairs')
    .select(`
      book_a_id, book_b_id, co_purchase_count,
      book_a:books!book_pairs_book_a_id_fkey(id, title, author, price, cover_image_url),
      book_b:books!book_pairs_book_b_id_fkey(id, title, author, price, cover_image_url)
    `)
    .or(ownedBookIds.map(id => `book_a_id.eq.${id},book_b_id.eq.${id}`).join(','))
    .order('co_purchase_count', { ascending: false })
    .limit(50)

  if (!pairs) return []

  // Extract recommended books not already owned
  const recommendations: Record<string, { book: any; score: number }> = {}
  pairs.forEach(pair => {
    const isA = ownedBookIds.includes(pair.book_a_id)
    const recommended = isA ? pair.book_b : pair.book_a
    const recId = isA ? pair.book_b_id : pair.book_a_id

    if (!ownedBookIds.includes(recId) && recommended) {
      if (!recommendations[recId]) {
        recommendations[recId] = { book: recommended, score: 0 }
      }
      recommendations[recId].score += pair.co_purchase_count
    }
  })

  return Object.values(recommendations)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({ ...r.book, relevance_score: r.score }))
}
