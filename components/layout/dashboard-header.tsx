'use client'

import Link from 'next/link'
import { logout } from '@/actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { User } from '@supabase/supabase-js'
import type { Profile, Role } from '@/types'

const roleLabels: Record<Role, string> = {
  admin: 'แอดมิน',
  staff: 'พนักงาน',
  member: 'สมาชิก',
}

const roleVariants: Record<Role, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  staff: 'secondary',
  member: 'outline',
}

function getSettingsHref(role: Role): string {
  if (role === 'admin' || role === 'staff') return '/admin/settings'
  return '/member/profile'
}

interface DashboardHeaderProps {
  user: User
  profile?: Profile | null
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const initials = user.user_metadata?.name
    ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? 'U'

  const role: Role = profile?.role ?? 'member'
  const displayName = profile?.name ?? user.user_metadata?.name ?? 'ผู้ใช้'

  return (
    <header className="h-16 border-b flex items-center justify-end gap-3 px-6">
      <Badge variant={roleVariants[role]}>
        {roleLabels[role]}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none hover:bg-accent transition-colors">
          <Avatar>
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="p-2 text-sm">
            <p className="font-medium">{displayName}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={getSettingsHref(role)} className="w-full">
              ตั้งค่า
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => logout()}
          >
            ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
