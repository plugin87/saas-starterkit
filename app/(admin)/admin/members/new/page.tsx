import { MemberForm } from '@/components/admin/members/member-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'เพิ่มสมาชิกใหม่' }

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มสมาชิกใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลสมาชิกที่ต้องการเพิ่มเข้าระบบ</p>
      </div>
      <MemberForm />
    </div>
  )
}
