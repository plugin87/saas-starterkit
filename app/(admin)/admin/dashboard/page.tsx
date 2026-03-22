import {
  getDashboardStats,
  getRevenueChart,
  getPopularBooks,
  getRecentSales,
  getLowStockAlerts,
} from '@/actions/dashboard'
import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { RecentSales } from '@/components/admin/dashboard/recent-sales'
import { PopularBooks } from '@/components/admin/dashboard/popular-books'
import { LowStockAlert } from '@/components/admin/dashboard/low-stock-alert'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'แดชบอร์ด',
}

export default async function AdminDashboardPage() {
  const [stats, chartData, popularBooks, recentSales, lowStock] =
    await Promise.all([
      getDashboardStats(),
      getRevenueChart(30),
      getPopularBooks(10),
      getRecentSales(10),
      getLowStockAlerts(10),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">ภาพรวมร้านหนังสือ</p>
      </div>

      <StatsCards
        totalMembers={stats.totalMembers}
        revenueToday={stats.revenueToday}
        booksSoldToday={stats.booksSoldToday}
        lowStockCount={stats.lowStockCount}
      />

      <RevenueChart data={chartData} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentSales data={recentSales} />
        <PopularBooks data={popularBooks} />
        <LowStockAlert data={lowStock} />
      </div>
    </div>
  )
}
