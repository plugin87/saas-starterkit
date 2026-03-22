'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'

import { bookSchema, type BookInput } from '@/lib/validations'
import { createBook, updateBook, uploadBookCover } from '@/actions/books'
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

interface BookFormProps {
  initialData?: {
    id: string
    title: string
    author: string
    isbn: string | null
    publisher: string | null
    description: string | null
    price: number
    cost_price: number | null
    stock_quantity: number
    low_stock_threshold: number
    category_id: string | null
    cover_image_url: string | null
    tags: string[]
    book_categories?: { id: string; name: string } | null
  }
  categories: { id: string; name: string }[]
}

export function BookForm({ initialData, categories }: BookFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [coverUrl, setCoverUrl] = useState<string | null>(
    initialData?.cover_image_url ?? null
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.category_id ?? ''
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      author: initialData?.author ?? '',
      isbn: initialData?.isbn ?? '',
      publisher: initialData?.publisher ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      stockQuantity: initialData?.stock_quantity ?? 0,
      lowStockThreshold: initialData?.low_stock_threshold ?? 5,
    },
  })

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadBookCover(formData)
    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      setCoverUrl(result.url)
      toast.success('อัปโหลดภาพปกเรียบร้อย')
    }
    setIsUploading(false)
  }

  function removeCover() {
    setCoverUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(data: BookInput) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set('title', data.title)
    formData.set('author', data.author)
    formData.set('isbn', data.isbn ?? '')
    formData.set('publisher', data.publisher ?? '')
    formData.set('description', data.description ?? '')
    formData.set('price', String(data.price))
    formData.set('costPrice', costPriceValue)
    formData.set('stockQuantity', String(data.stockQuantity))
    formData.set('lowStockThreshold', String(data.lowStockThreshold))
    formData.set('categoryId', selectedCategoryId)
    formData.set('coverImageUrl', coverUrl ?? '')
    formData.set('tags', tagsValue)

    let result: { error?: string | null }

    if (isEditMode) {
      result = await updateBook(initialData.id, formData)
    } else {
      result = await createBook(formData)
    }

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success(
        isEditMode ? 'แก้ไขหนังสือเรียบร้อยแล้ว' : 'เพิ่มหนังสือเรียบร้อยแล้ว'
      )
      router.push('/admin/books')
    }
  }

  const [tagsValue, setTagsValue] = useState<string>(
    initialData?.tags?.join(', ') ?? ''
  )

  const [costPriceValue, setCostPriceValue] = useState<string>(
    initialData?.cost_price != null ? String(initialData.cost_price) : ''
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? 'แก้ไขข้อมูลหนังสือ' : 'ข้อมูลหนังสือ'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="book-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* ภาพปก */}
          <div className="space-y-2">
            <Label>ภาพปก</Label>
            <div className="flex items-start gap-4">
              <div className="relative h-[150px] w-[100px] overflow-hidden rounded-md border bg-muted">
                {coverUrl ? (
                  <>
                    <Image
                      src={coverUrl}
                      alt="ภาพปกหนังสือ"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 hover:bg-background"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-xs text-muted-foreground">
                    <Upload className="mb-1 h-6 w-6" />
                    ไม่มีภาพ
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-auto"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังอัปโหลด...
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                </p>
              </div>
            </div>
          </div>

          {/* ชื่อหนังสือ */}
          <div className="space-y-2">
            <Label htmlFor="title">ชื่อหนังสือ *</Label>
            <Input
              id="title"
              placeholder="กรอกชื่อหนังสือ"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* ผู้แต่ง */}
          <div className="space-y-2">
            <Label htmlFor="author">ผู้แต่ง *</Label>
            <Input
              id="author"
              placeholder="กรอกชื่อผู้แต่ง"
              {...register('author')}
            />
            {errors.author && (
              <p className="text-sm text-destructive">
                {errors.author.message}
              </p>
            )}
          </div>

          {/* ISBN + สำนักพิมพ์ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="978-xxx-xxx-xxx-x"
                {...register('isbn')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">สำนักพิมพ์</Label>
              <Input
                id="publisher"
                placeholder="กรอกชื่อสำนักพิมพ์"
                {...register('publisher')}
              />
            </div>
          </div>

          {/* หมวดหมู่ */}
          <div className="space-y-2">
            <Label>หมวดหมู่</Label>
            <Select
              value={selectedCategoryId || undefined}
              onValueChange={(value) => setSelectedCategoryId(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ราคา + ราคาทุน */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">ราคา (บาท) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">ราคาทุน (บาท)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={costPriceValue}
                onChange={(e) => setCostPriceValue(e.target.value)}
              />
            </div>
          </div>

          {/* สต็อก + แจ้งเตือน */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">จำนวนในสต็อก</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                placeholder="0"
                {...register('stockQuantity', { valueAsNumber: true })}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">แจ้งเตือนเมื่อเหลือ</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                placeholder="5"
                {...register('lowStockThreshold', { valueAsNumber: true })}
              />
              {errors.lowStockThreshold && (
                <p className="text-sm text-destructive">
                  {errors.lowStockThreshold.message}
                </p>
              )}
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              placeholder="กรอกรายละเอียดหนังสือ"
              rows={4}
              {...register('description')}
            />
          </div>

          {/* แท็ก */}
          <div className="space-y-2">
            <Label htmlFor="tags">แท็ก</Label>
            <Input
              id="tags"
              placeholder="คั่นด้วยเครื่องหมายจุลภาค เช่น นิยาย, แฟนตาซี, วรรณกรรม"
              value={tagsValue}
              onChange={(e) => setTagsValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              คั่นแต่ละแท็กด้วยเครื่องหมายจุลภาค (,)
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/books')}
          disabled={isSubmitting}
        >
          ยกเลิก
        </Button>
        <Button type="submit" form="book-form" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : isEditMode ? (
            'บันทึกการแก้ไข'
          ) : (
            'เพิ่มหนังสือ'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
