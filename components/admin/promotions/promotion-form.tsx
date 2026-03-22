'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { createPromotion, updatePromotion } from '@/actions/promotions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const promotionTypes = [
  { value: 'percent_discount', label: 'ลดเปอร์เซ็นต์' },
  { value: 'fixed_discount', label: 'ลดราคาคงที่' },
  { value: 'buy_x_get_y', label: 'ซื้อ X แถม Y' },
  { value: 'spend_threshold', label: 'ซื้อครบ X ได้ Y' },
  { value: 'bundle', label: 'ชุดหนังสือ' },
  { value: 'points_multiplier', label: 'คูณคะแนน' },
] as const

const tierOptions = [
  { value: '', label: 'ทุกระดับ' },
  { value: 'silver', label: 'ซิลเวอร์' },
  { value: 'gold', label: 'โกลด์' },
  { value: 'platinum', label: 'แพลทินัม' },
] as const

interface PromotionFormProps {
  initialData?: {
    id: string
    name: string
    description: string | null
    type: string
    config: Record<string, unknown>
    min_tier: string | null
    starts_at: string
    ends_at: string
    max_uses: number | null
    used_count: number
    is_active: boolean
    book_ids: string[] | null
  }
}

function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function PromotionForm({ initialData }: PromotionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!initialData

  // Common fields
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [type, setType] = useState(initialData?.type ?? 'percent_discount')
  const [startsAt, setStartsAt] = useState(
    initialData?.starts_at ? toDatetimeLocal(initialData.starts_at) : ''
  )
  const [endsAt, setEndsAt] = useState(
    initialData?.ends_at ? toDatetimeLocal(initialData.ends_at) : ''
  )
  const [minTier, setMinTier] = useState(initialData?.min_tier ?? '')
  const [maxUses, setMaxUses] = useState(
    initialData?.max_uses != null ? String(initialData.max_uses) : ''
  )
  const [bookIds, setBookIds] = useState(
    initialData?.book_ids?.join(', ') ?? ''
  )

  // Config fields — percent_discount
  const [percentValue, setPercentValue] = useState(
    initialData?.type === 'percent_discount'
      ? String((initialData.config as Record<string, number>).percent ?? '')
      : ''
  )
  const [percentMinItems, setPercentMinItems] = useState(
    initialData?.type === 'percent_discount'
      ? String((initialData.config as Record<string, number>).min_items ?? '')
      : ''
  )

  // Config fields — fixed_discount
  const [fixedAmount, setFixedAmount] = useState(
    initialData?.type === 'fixed_discount'
      ? String((initialData.config as Record<string, number>).amount ?? '')
      : ''
  )
  const [fixedMinSpend, setFixedMinSpend] = useState(
    initialData?.type === 'fixed_discount'
      ? String((initialData.config as Record<string, number>).min_spend ?? '')
      : ''
  )

  // Config fields — buy_x_get_y
  const [buyCount, setBuyCount] = useState(
    initialData?.type === 'buy_x_get_y'
      ? String((initialData.config as Record<string, number>).buy ?? '')
      : ''
  )
  const [getCount, setGetCount] = useState(
    initialData?.type === 'buy_x_get_y'
      ? String((initialData.config as Record<string, number>).get ?? '')
      : ''
  )
  const [getDiscountPercent, setGetDiscountPercent] = useState(
    initialData?.type === 'buy_x_get_y'
      ? String((initialData.config as Record<string, number>).get_discount_percent ?? '')
      : ''
  )

  // Config fields — spend_threshold
  const [thresholdMinSpend, setThresholdMinSpend] = useState(
    initialData?.type === 'spend_threshold'
      ? String((initialData.config as Record<string, number>).min_spend ?? '')
      : ''
  )
  const [thresholdRewardValue, setThresholdRewardValue] = useState(
    initialData?.type === 'spend_threshold'
      ? String((initialData.config as Record<string, number>).reward_value ?? '')
      : ''
  )

  // Config fields — bundle
  const [bundlePrice, setBundlePrice] = useState(
    initialData?.type === 'bundle'
      ? String((initialData.config as Record<string, number>).bundle_price ?? '')
      : ''
  )

  // Config fields — points_multiplier
  const [multiplier, setMultiplier] = useState(
    initialData?.type === 'points_multiplier'
      ? String((initialData.config as Record<string, number>).multiplier ?? '')
      : ''
  )

  function buildConfig(): Record<string, unknown> {
    switch (type) {
      case 'percent_discount':
        return {
          percent: Number(percentValue) || 0,
          min_items: Number(percentMinItems) || 0,
        }
      case 'fixed_discount':
        return {
          amount: Number(fixedAmount) || 0,
          min_spend: Number(fixedMinSpend) || 0,
        }
      case 'buy_x_get_y':
        return {
          buy: Number(buyCount) || 0,
          get: Number(getCount) || 0,
          get_discount_percent: Number(getDiscountPercent) || 100,
        }
      case 'spend_threshold':
        return {
          min_spend: Number(thresholdMinSpend) || 0,
          reward_type: 'discount',
          reward_value: Number(thresholdRewardValue) || 0,
        }
      case 'bundle':
        return {
          bundle_price: Number(bundlePrice) || 0,
        }
      case 'points_multiplier':
        return {
          multiplier: Number(multiplier) || 2,
        }
      default:
        return {}
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('กรุณากรอกชื่อโปรโมชั่น')
      return
    }
    if (!startsAt || !endsAt) {
      toast.error('กรุณากรอกวันเริ่มต้นและวันสิ้นสุด')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('description', description.trim())
    formData.set('type', type)
    formData.set('config', JSON.stringify(buildConfig()))
    formData.set('minTier', minTier)
    formData.set('startsAt', new Date(startsAt).toISOString())
    formData.set('endsAt', new Date(endsAt).toISOString())
    formData.set('maxUses', maxUses)
    formData.set('bookIds', bookIds.trim())

    let result: { error?: string | null }

    if (isEditMode) {
      result = await updatePromotion(initialData.id, formData)
    } else {
      result = await createPromotion(formData)
    }

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success(
        isEditMode
          ? 'แก้ไขโปรโมชั่นเรียบร้อยแล้ว'
          : 'สร้างโปรโมชั่นเรียบร้อยแล้ว'
      )
      router.push('/admin/promotions')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'แก้ไขโปรโมชั่น' : 'ข้อมูลโปรโมชั่น'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="promotion-form" onSubmit={handleSubmit} className="space-y-6">
          {/* ชื่อโปรโมชั่น */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อโปรโมชั่น *</Label>
            <Input
              id="name"
              placeholder="กรอกชื่อโปรโมชั่น"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* รายละเอียด */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              placeholder="กรอกรายละเอียดโปรโมชั่น"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* ประเภท */}
          <div className="space-y-2">
            <Label>ประเภท *</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกประเภทโปรโมชั่น" />
              </SelectTrigger>
              <SelectContent>
                {promotionTypes.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic config fields */}
          <div className="rounded-lg border p-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              ตั้งค่าเงื่อนไข
            </p>

            {type === 'percent_discount' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="percentValue">เปอร์เซ็นต์ลด (%)</Label>
                  <Input
                    id="percentValue"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="เช่น 10"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percentMinItems">จำนวนขั้นต่ำ (เล่ม)</Label>
                  <Input
                    id="percentMinItems"
                    type="number"
                    min="0"
                    placeholder="เช่น 2"
                    value={percentMinItems}
                    onChange={(e) => setPercentMinItems(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'fixed_discount' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fixedAmount">ส่วนลด (บาท)</Label>
                  <Input
                    id="fixedAmount"
                    type="number"
                    min="0"
                    placeholder="เช่น 50"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedMinSpend">ยอดซื้อขั้นต่ำ (บาท)</Label>
                  <Input
                    id="fixedMinSpend"
                    type="number"
                    min="0"
                    placeholder="เช่น 500"
                    value={fixedMinSpend}
                    onChange={(e) => setFixedMinSpend(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'buy_x_get_y' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="buyCount">ซื้อ (เล่ม)</Label>
                  <Input
                    id="buyCount"
                    type="number"
                    min="1"
                    placeholder="เช่น 2"
                    value={buyCount}
                    onChange={(e) => setBuyCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getCount">แถม (เล่ม)</Label>
                  <Input
                    id="getCount"
                    type="number"
                    min="1"
                    placeholder="เช่น 1"
                    value={getCount}
                    onChange={(e) => setGetCount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getDiscountPercent">เปอร์เซ็นต์ลดของแถม (%)</Label>
                  <Input
                    id="getDiscountPercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="เช่น 100"
                    value={getDiscountPercent}
                    onChange={(e) => setGetDiscountPercent(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'spend_threshold' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="thresholdMinSpend">ยอดซื้อขั้นต่ำ (บาท)</Label>
                  <Input
                    id="thresholdMinSpend"
                    type="number"
                    min="0"
                    placeholder="เช่น 1000"
                    value={thresholdMinSpend}
                    onChange={(e) => setThresholdMinSpend(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thresholdRewardValue">ส่วนลด (บาท)</Label>
                  <Input
                    id="thresholdRewardValue"
                    type="number"
                    min="0"
                    placeholder="เช่น 100"
                    value={thresholdRewardValue}
                    onChange={(e) => setThresholdRewardValue(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'bundle' && (
              <div className="space-y-2">
                <Label htmlFor="bundlePrice">ราคาชุด (บาท)</Label>
                <Input
                  id="bundlePrice"
                  type="number"
                  min="0"
                  placeholder="เช่น 599"
                  value={bundlePrice}
                  onChange={(e) => setBundlePrice(e.target.value)}
                />
              </div>
            )}

            {type === 'points_multiplier' && (
              <div className="space-y-2">
                <Label htmlFor="multiplier">ตัวคูณ</Label>
                <Input
                  id="multiplier"
                  type="number"
                  min="1"
                  placeholder="เช่น 2"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* วันเริ่มต้น + วันสิ้นสุด */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startsAt">วันเริ่มต้น *</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endsAt">วันสิ้นสุด *</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ระดับสมาชิกขั้นต่ำ */}
          <div className="space-y-2">
            <Label>ระดับสมาชิกขั้นต่ำ</Label>
            <Select
              value={minTier || 'all'}
              onValueChange={(value) =>
                setMinTier(value === 'all' ? '' : (value as string))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกระดับสมาชิก" />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((opt) => (
                  <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* จำนวนครั้งสูงสุด */}
          <div className="space-y-2">
            <Label htmlFor="maxUses">จำนวนครั้งสูงสุด</Label>
            <Input
              id="maxUses"
              type="number"
              min="0"
              placeholder="ว่างไว้ = ไม่จำกัด"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              เว้นว่างไว้หากไม่ต้องการจำกัดจำนวนครั้ง
            </p>
          </div>

          {/* Book IDs */}
          <div className="space-y-2">
            <Label htmlFor="bookIds">รหัสหนังสือที่เกี่ยวข้อง</Label>
            <Input
              id="bookIds"
              placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น id1, id2, id3"
              value={bookIds}
              onChange={(e) => setBookIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ระบุรหัสหนังสือที่ร่วมโปรโมชั่น คั่นด้วยจุลภาค (,) เว้นว่างหากใช้ได้กับทุกเล่ม
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/promotions')}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button type="submit" form="promotion-form" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : isEditMode ? (
            'บันทึกการแก้ไข'
          ) : (
            'สร้างโปรโมชั่น'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
