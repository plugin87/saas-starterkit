'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Receipt,
  Tag,
  Star,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'

const navItems: NavItem[] = [
  { label: 'แดชบอร์ด', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'สมาชิก', href: '/admin/members', icon: Users },
  { label: 'คลังหนังสือ', href: '/admin/books', icon: BookOpen },
  { label: 'บันทึกการขาย', href: '/admin/sales', icon: ShoppingCart },
  { label: 'ประวัติการขาย', href: '/admin/sales/history', icon: Receipt },
  { label: 'โปรโมชั่น', href: '/admin/promotions', icon: Tag },
  { label: 'คะแนนสะสม', href: '/admin/points', icon: Star },
  { label: 'ตั้งค่า', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ร้านหนังสือ</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon!
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' &&
              item.href !== '/admin/sales' &&
              pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
