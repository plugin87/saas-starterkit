'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMyProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ', data: null }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.get('name') as string,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
      date_of_birth: (formData.get('dateOfBirth') as string) || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/member/profile')
  return { error: null }
}

export async function getMyPurchases(page = 1, pageSize = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ', data: null, count: 0 }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('purchases')
    .select(`
      id, subtotal, discount_amount, points_discount, total, points_earned, points_redeemed, payment_method, created_at,
      purchase_items(id, quantity, unit_price, total, books(title, author))
    `, { count: 'exact' })
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function getMyPoints(page = 1, pageSize = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ', data: null, count: 0 }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('points_transactions')
    .select('*', { count: 'exact' })
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}
