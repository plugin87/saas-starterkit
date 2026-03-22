'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface SaleItem {
  bookId: string
  quantity: number
  unitPrice: number
}

interface RecordPurchaseInput {
  memberId: string | null
  items: SaleItem[]
  pointsToRedeem: number
  paymentMethod: 'cash' | 'card' | 'transfer' | 'qr'
  note: string
}

export async function recordPurchase(input: RecordPurchaseInput) {
  const supabase = await createClient()

  // Get current user as staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  if (input.items.length === 0) return { error: 'ไม่มีรายการสินค้า' }

  // 1. Validate stock for all items
  const bookIds = input.items.map((i) => i.bookId)
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, stock_quantity, price')
    .in('id', bookIds)

  if (booksError || !books) return { error: 'ไม่สามารถดึงข้อมูลหนังสือได้' }

  for (const item of input.items) {
    const book = books.find((b) => b.id === item.bookId)
    if (!book) return { error: `ไม่พบหนังสือ: ${item.bookId}` }
    if (book.stock_quantity < item.quantity) {
      return { error: `"${book.title}" มีสต็อกไม่เพียงพอ (เหลือ ${book.stock_quantity} เล่ม)` }
    }
  }

  // 2. Fetch member info if provided
  let memberProfile: {
    id: string
    total_spent: number
    total_points: number
    available_points: number
    membership_tier: string
  } | null = null
  let tierDiscount = 0
  let pointsMultiplier = 1.0

  if (input.memberId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, membership_tiers(*)')
      .eq('id', input.memberId)
      .single()

    if (!profile) return { error: 'ไม่พบข้อมูลสมาชิก' }
    memberProfile = profile

    // Get tier config
    const { data: tierConfig } = await supabase
      .from('membership_tiers')
      .select('*')
      .eq('id', profile.membership_tier)
      .single()

    if (tierConfig) {
      tierDiscount = Number(tierConfig.discount_percent)
      pointsMultiplier = Number(tierConfig.points_multiplier)
    }

    // Validate points to redeem
    if (input.pointsToRedeem > profile.available_points) {
      return { error: `คะแนนไม่เพียงพอ (มี ${profile.available_points} คะแนน)` }
    }
  }

  // 3. Calculate totals
  const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discountAmount = input.memberId ? Math.floor(subtotal * tierDiscount / 100) : 0
  const pointsDiscount = Math.floor(input.pointsToRedeem / 100) * 5  // 100 points = 5 baht
  const total = Math.max(0, subtotal - discountAmount - pointsDiscount)
  const pointsEarned = input.memberId ? Math.floor(total * pointsMultiplier) : 0

  // 4. Create purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      member_id: input.memberId || null,
      staff_id: user.id,
      subtotal,
      discount_amount: discountAmount,
      points_redeemed: input.pointsToRedeem,
      points_discount: pointsDiscount,
      total,
      points_earned: pointsEarned,
      payment_method: input.paymentMethod,
      note: input.note || null,
    })
    .select()
    .single()

  if (purchaseError || !purchase) return { error: purchaseError?.message || 'ไม่สามารถบันทึกการขายได้' }

  // 5. Create purchase items
  const purchaseItems = input.items.map((item) => ({
    purchase_id: purchase.id,
    book_id: item.bookId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    discount_amount: 0,
    total: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('purchase_items')
    .insert(purchaseItems)

  if (itemsError) return { error: itemsError.message }

  // 6. Deduct stock for each book
  for (const item of input.items) {
    const book = books.find((b) => b.id === item.bookId)!
    const { error: stockError } = await supabase
      .from('books')
      .update({ stock_quantity: book.stock_quantity - item.quantity })
      .eq('id', item.bookId)

    if (stockError) return { error: `ไม่สามารถหักสต็อก: ${stockError.message}` }
  }

  // 7. Update member points and total_spent (if member)
  if (input.memberId && memberProfile) {
    const newTotalSpent = Number(memberProfile.total_spent) + total
    const newTotalPoints = memberProfile.total_points + pointsEarned - input.pointsToRedeem
    const newAvailablePoints = memberProfile.available_points + pointsEarned - input.pointsToRedeem

    const { error: memberError } = await supabase
      .from('profiles')
      .update({
        total_spent: newTotalSpent,
        total_points: newTotalPoints,
        available_points: newAvailablePoints,
      })
      .eq('id', input.memberId)

    if (memberError) return { error: memberError.message }

    // 8. Create points transactions
    if (pointsEarned > 0) {
      await supabase.from('points_transactions').insert({
        member_id: input.memberId,
        purchase_id: purchase.id,
        type: 'earn',
        points: pointsEarned,
        balance_after: newAvailablePoints,
        description: `ได้รับคะแนนจากการซื้อ #${purchase.id.slice(0, 8)}`,
        created_by: user.id,
      })
    }

    if (input.pointsToRedeem > 0) {
      await supabase.from('points_transactions').insert({
        member_id: input.memberId,
        purchase_id: purchase.id,
        type: 'redeem',
        points: -input.pointsToRedeem,
        balance_after: newAvailablePoints,
        description: `แลกคะแนนในการซื้อ #${purchase.id.slice(0, 8)} (ลด ${pointsDiscount} บาท)`,
        created_by: user.id,
      })
    }
  }

  // 9. Log activity
  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: 'purchase_recorded',
    entity_type: 'purchase',
    entity_id: purchase.id,
    metadata: {
      member_id: input.memberId,
      total,
      items_count: input.items.length,
      points_earned: pointsEarned,
      points_redeemed: input.pointsToRedeem,
    },
  })

  revalidatePath('/admin/sales')
  revalidatePath('/admin/dashboard')
  if (input.memberId) {
    revalidatePath(`/admin/members/${input.memberId}`)
  }

  return {
    error: null,
    data: {
      purchaseId: purchase.id,
      total,
      pointsEarned,
      pointsRedeemed: input.pointsToRedeem,
    },
  }
}

export async function getSalesHistory({
  search,
  page = 1,
  pageSize = 20,
}: {
  search?: string
  page?: number
  pageSize?: number
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('purchases')
    .select(`
      *,
      member:profiles!purchases_member_id_fkey(id, name, member_code),
      staff:profiles!purchases_staff_id_fkey(id, name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function getSaleDetail(id: string) {
  const supabase = await createClient()

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select(`
      *,
      member:profiles!purchases_member_id_fkey(id, name, member_code, membership_tier),
      staff:profiles!purchases_staff_id_fkey(id, name),
      purchase_items(*, books(id, title, author, cover_image_url))
    `)
    .eq('id', id)
    .single()

  if (purchaseError) return { error: purchaseError.message, data: null }
  return { data: purchase, error: null }
}
