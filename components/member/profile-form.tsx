'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

import { updateMyProfile } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

const profileFormSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  initialData: {
    name: string | null
    email: string | null
    phone: string | null
    date_of_birth: string | null
    address: string | null
    member_code: string | null
    membership_tier: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData.name ?? '',
      phone: initialData.phone ?? '',
      dateOfBirth: initialData.date_of_birth ?? '',
      address: initialData.address ?? '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('name', data.name)
    formData.set('phone', data.phone ?? '')
    formData.set('dateOfBirth', data.dateOfBirth ?? '')
    formData.set('address', data.address ?? '')

    const result = await updateMyProfile(formData)

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success('บันทึกข้อมูลเรียบร้อยแล้ว')
      setIsSubmitting(false)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลส่วนตัว</CardTitle>
        <CardDescription>
          รหัสสมาชิก: {initialData.member_code ?? '-'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* ชื่อ-นามสกุล */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              placeholder="กรอกชื่อ-นามสกุล"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* อีเมล (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email ?? ''}
              disabled
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              ไม่สามารถแก้ไขอีเมลได้
            </p>
          </div>

          {/* เบอร์โทรศัพท์ + วันเกิด */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                placeholder="0xx-xxx-xxxx"
                {...register('phone')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">วันเกิด</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
            </div>
          </div>

          {/* ที่อยู่ */}
          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่</Label>
            <Textarea
              id="address"
              placeholder="กรอกที่อยู่"
              rows={3}
              {...register('address')}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" form="profile-form" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            'บันทึก'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
