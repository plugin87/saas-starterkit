'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Receipt,
  Star,
  Tag,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/types'

const navItems: NavItem[] = [
  { label: 'หน้าหลัก', href: '/member', icon: Home },
  { label: 'ประวัติการซื้อ', href: '/member/history', icon: Receipt },
  { label: 'คะแนนสะสม', href: '/member/points', icon: Star },
  { label: 'โปรโมชั่น', href: '/member/promotions', icon: Tag },
  { label: 'โปรไฟล์', href: '/member/profile', icon: UserCircle },
]

export function MemberSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/40 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/member" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ร้านหนังสือ</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon!
          const isActive =
            item.href === '/member'
              ? pathname === '/member'
              : pathname.startsWith(item.href)
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
