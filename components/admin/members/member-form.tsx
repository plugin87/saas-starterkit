'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { memberSchema, createMemberSchema, type MemberInput, type CreateMemberInput } from '@/lib/validations'
import { createMember, updateMember } from '@/actions/members'
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
} from '@/components/ui/card'

interface MemberFormProps {
  initialData?: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    date_of_birth: string | null
    address: string | null
    note: string | null
    member_code: string | null
    membership_tier: string
    total_spent: number
    available_points: number
    is_active: boolean
  }
}

export function MemberForm({ initialData }: MemberFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(isEditMode ? memberSchema : createMemberSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      dateOfBirth: initialData?.date_of_birth ?? '',
      address: initialData?.address ?? '',
      note: initialData?.note ?? '',
      ...(isEditMode ? {} : { password: '' }),
    },
  })

  async function onSubmit(data: CreateMemberInput | MemberInput) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('name', data.name)
    formData.set('email', data.email)
    formData.set('phone', data.phone ?? '')
    formData.set('dateOfBirth', data.dateOfBirth ?? '')
    formData.set('address', data.address ?? '')
    formData.set('note', data.note ?? '')

    let result: { error?: string | null }

    if (isEditMode) {
      result = await updateMember(initialData.id, formData)
    } else {
      formData.set('password', (data as CreateMemberInput).password)
      result = await createMember(formData)
    }

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success(
        isEditMode ? 'แก้ไขข้อมูลสมาชิกเรียบร้อยแล้ว' : 'เพิ่มสมาชิกเรียบร้อยแล้ว'
      )
      router.push('/admin/members')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'แก้ไขข้อมูลสมาชิก' : 'ข้อมูลสมาชิก'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="member-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* ชื่อ-นามสกุล */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
            <Input
              id="name"
              placeholder="กรอกชื่อ-นามสกุล"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* อีเมล */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              placeholder="กรอกอีเมล"
              disabled={isEditMode}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            {isEditMode && (
              <p className="text-xs text-muted-foreground">
                ไม่สามารถแก้ไขอีเมลได้
              </p>
            )}
          </div>

          {/* รหัสผ่าน — เฉพาะโหมดสร้างใหม่ */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน *</Label>
              <Input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                {...register('password')}
              />
              {(errors as Record<string, { message?: string }>).password && (
                <p className="text-sm text-destructive">
                  {(errors as Record<string, { message?: string }>).password?.message}
                </p>
              )}
            </div>
          )}

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

          {/* หมายเหตุ */}
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุ</Label>
            <Textarea
              id="note"
              placeholder="บันทึกหมายเหตุสำหรับสมาชิกรายนี้"
              rows={3}
              {...register('note')}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/members')}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button type="submit" form="member-form" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : isEditMode ? (
            'บันทึกการแก้ไข'
          ) : (
            'เพิ่มสมาชิก'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
