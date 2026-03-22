'use server'

import { createClient } from '@/utils/supabase/server'
import { memberSchema, createMemberSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getMembers({
  search,
  tier,
  status,
  page = 1,
  pageSize = 20,
}: {
  search?: string
  tier?: string
  status?: 'active' | 'inactive' | 'all'
  page?: number
  pageSize?: number
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'member')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,member_code.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (tier && tier !== 'all') {
    query = query.eq('membership_tier', tier)
  }

  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }
  // 'all' = no filter

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function getMember(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createMember(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    dateOfBirth: (formData.get('dateOfBirth') as string) || undefined,
    note: (formData.get('note') as string) || undefined,
    password: formData.get('password') as string,
  }

  const parsed = createMemberSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Create auth account via Supabase admin API (service role)
  // Note: createClient here uses the anon key. For admin user creation,
  // we use supabase.auth.signUp with auto-confirm or use admin.createUser
  // For simplicity, use signUp which the handle_new_user trigger will process
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? '',
        role: 'member',
      },
    },
  })

  if (authError) return { error: authError.message }

  // The handle_new_user trigger should have created the profile.
  // Update additional fields that the trigger doesn't set.
  if (authData.user) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        date_of_birth: parsed.data.dateOfBirth || null,
        note: parsed.data.note || null,
      })
      .eq('id', authData.user.id)

    if (updateError) return { error: updateError.message }
  }

  revalidatePath('/admin/members')
  return { error: null }
}

export async function updateMember(id: string, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    dateOfBirth: (formData.get('dateOfBirth') as string) || undefined,
    note: (formData.get('note') as string) || undefined,
  }

  const parsed = memberSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      date_of_birth: parsed.data.dateOfBirth || null,
      note: parsed.data.note || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${id}`)
  return { error: null }
}

export async function deactivateMember(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/members')
  return { error: null }
}

export async function reactivateMember(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/members')
  return { error: null }
}

export async function getMemberStats(id: string) {
  const supabase = await createClient()

  // Get purchase count and total
  const { count: purchaseCount } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', id)

  // Get recent purchases
  const { data: recentPurchases } = await supabase
    .from('purchases')
    .select('id, total, points_earned, created_at')
    .eq('member_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    purchaseCount: purchaseCount ?? 0,
    recentPurchases: recentPurchases ?? [],
  }
}
