import { getMembers } from '@/actions/members'
import { MemberTable } from '@/components/admin/members/member-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'สมาชิก' }

export default async function MembersPage() {
  const { data: members } = await getMembers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">สมาชิก</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสมาชิกทั้งหมด</p>
        </div>
        <Link href="/admin/members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มสมาชิกใหม่
          </Button>
        </Link>
      </div>
      <MemberTable data={members ?? []} />
    </div>
  )
}
