import type { Metadata } from 'next'

import { getMyProfile } from '@/actions/profile'
import { ProfileForm } from '@/components/member/profile-form'
import {
  Card,
  CardContent,
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'โปรไฟล์ | สมาชิก',
}

export default async function ProfilePage() {
  const { data: profile, error } = await getMyProfile()

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">โปรไฟล์</h1>
          <p className="text-muted-foreground">แก้ไขข้อมูลส่วนตัวของคุณ</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            ไม่สามารถโหลดข้อมูลโปรไฟล์ได้: {error ?? 'ไม่พบข้อมูล'}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">โปรไฟล์</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูลส่วนตัวของคุณ</p>
      </div>

      <ProfileForm initialData={profile} />
    </div>
  )
}
