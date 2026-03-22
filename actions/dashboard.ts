'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // Total active members
  const { count: totalMembers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'member')
    .eq('is_active', true)

  // Today's revenue
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todaySales } = await supabase
    .from('purchases')
    .select('total')
    .gte('created_at', today.toISOString())

  const revenueToday = todaySales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0

  // This month's revenue
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const { data: monthSales } = await supabase
    .from('purchases')
    .select('total')
    .gte('created_at', monthStart.toISOString())

  const revenueMonth = monthSales?.reduce((sum, s) => sum + Number(s.total), 0) ?? 0

  // Books sold today
  const { data: todayItems } = await supabase
    .from('purchase_items')
    .select('quantity, purchases!inner(created_at)')
    .gte('purchases.created_at', today.toISOString())

  const booksSoldToday = todayItems?.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  // Low stock count
  const { count: lowStockCount } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .lte('stock_quantity', 5)

  return {
    totalMembers: totalMembers ?? 0,
    revenueToday,
    revenueMonth,
    booksSoldToday,
    lowStockCount: lowStockCount ?? 0,
  }
}

export async function getRevenueChart(days: number = 30) {
  const supabase = await createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('purchases')
    .select('total, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Group by date
  const grouped: Record<string, number> = {}
  for (let i = 0; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - days + i)
    const key = date.toISOString().split('T')[0]
    grouped[key] = 0
  }

  data?.forEach((sale) => {
    const key = new Date(sale.created_at).toISOString().split('T')[0]
    if (grouped[key] !== undefined) {
      grouped[key] += Number(sale.total)
    }
  })

  return Object.entries(grouped).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}

export async function getPopularBooks(limit: number = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .rpc('get_popular_books', { limit_count: limit })

  // Fallback if RPC doesn't exist — query manually
  if (!data) {
    const { data: items } = await supabase
      .from('purchase_items')
      .select('book_id, quantity, books(id, title, author, cover_image_url, price)')

    if (!items) return []

    const bookSales: Record<string, { book: any; totalSold: number }> = {}
    items.forEach((item) => {
      const bookId = item.book_id
      if (!bookSales[bookId]) {
        bookSales[bookId] = { book: item.books, totalSold: 0 }
      }
      bookSales[bookId].totalSold += item.quantity
    })

    return Object.values(bookSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)
      .map(({ book, totalSold }) => ({ ...book, total_sold: totalSold }))
  }

  return data
}

export async function getRecentSales(limit: number = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('purchases')
    .select(`
      id, total, points_earned, payment_method, created_at,
      member:profiles!purchases_member_id_fkey(name, member_code),
      staff:profiles!purchases_staff_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getLowStockAlerts(limit: number = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('books')
    .select('id, title, author, stock_quantity, low_stock_threshold')
    .eq('is_active', true)
    .lte('stock_quantity', 5)
    .order('stock_quantity', { ascending: true })
    .limit(limit)

  return data ?? []
}

export async function getRecentActivity(limit: number = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('activity_log')
    .select(`
      *,
      actor:profiles!activity_log_actor_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}
