'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPointsHistory({
  memberId,
  type,
  page = 1,
  pageSize = 20,
}: {
  memberId?: string
  type?: 'earn' | 'redeem' | 'expire' | 'adjust'
  page?: number
  pageSize?: number
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('points_transactions')
    .select(`
      *,
      member:profiles!points_transactions_member_id_fkey(id, name, member_code),
      staff:profiles!points_transactions_created_by_fkey(id, name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  if (type) {
    query = query.eq('type', type)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) return { error: error.message, data: null, count: 0 }
  return { data, error: null, count: count ?? 0 }
}

export async function adjustPoints(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const points = Number(formData.get('points'))
  const description = formData.get('description') as string

  if (!memberId) return { error: 'กรุณาเลือกสมาชิก' }
  if (!points || points === 0) return { error: 'กรุณากรอกจำนวนคะแนน' }
  if (!description) return { error: 'กรุณากรอกเหตุผล' }

  const supabase = await createClient()

  // Get current user as staff
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่ได้เข้าสู่ระบบ' }

  // Get member's current points
  const { data: member, error: memberError } = await supabase
    .from('profiles')
    .select('available_points, total_points, name')
    .eq('id', memberId)
    .single()

  if (memberError || !member) return { error: 'ไม่พบข้อมูลสมาชิก' }

  const newAvailablePoints = member.available_points + points
  if (newAvailablePoints < 0) {
    return { error: `คะแนนไม่เพียงพอ (มี ${member.available_points} คะแนน)` }
  }

  const newTotalPoints = member.total_points + (points > 0 ? points : 0)

  // Update member points
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      available_points: newAvailablePoints,
      total_points: newTotalPoints,
    })
    .eq('id', memberId)

  if (updateError) return { error: updateError.message }

  // Create points transaction
  const { error: txError } = await supabase
    .from('points_transactions')
    .insert({
      member_id: memberId,
      type: 'adjust',
      points,
      balance_after: newAvailablePoints,
      description: `[ปรับด้วยมือ] ${description}`,
      created_by: user.id,
    })

  if (txError) return { error: txError.message }

  // Log activity
  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: 'points_adjusted',
    entity_type: 'member',
    entity_id: memberId,
    metadata: { points, description, new_balance: newAvailablePoints },
  })

  revalidatePath('/admin/points')
  revalidatePath(`/admin/members/${memberId}`)

  return { error: null }
}
