'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import type { BookCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryNode extends BookCategory {
  children?: CategoryNode[]
}

interface CategoryManagerProps {
  categories: CategoryNode[]
  flatCategories: BookCategory[]
}

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// CategoryDialog (shared create / edit dialog)
// ---------------------------------------------------------------------------

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: BookCategory | null
  flatCategories: BookCategory[]
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
  flatCategories,
}: CategoryDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!category

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setSlug(category.slug)
        setSlugManual(true)
        setDescription(category.description ?? '')
        setParentId(category.parentId ?? null)
      } else {
        setName('')
        setSlug('')
        setSlugManual(false)
        setDescription('')
        setParentId(null)
      }
    }
  }, [open, category])

  // Auto-generate slug from name unless user has manually edited it
  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true)
    setSlug(value)
  }

  // Filter out self and descendants when editing (to prevent circular parents)
  function getAvailableParents(): BookCategory[] {
    if (!category) return flatCategories
    const excludeIds = new Set<string>()
    excludeIds.add(category.id)

    // Collect all descendants
    function collectDescendants(parentId: string) {
      for (const cat of flatCategories) {
        if (cat.parentId === parentId && !excludeIds.has(cat.id)) {
          excludeIds.add(cat.id)
          collectDescendants(cat.id)
        }
      }
    }
    collectDescendants(category.id)

    return flatCategories.filter((c) => !excludeIds.has(c.id))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData()
    formData.set('name', name.trim())
    formData.set('slug', slug.trim())
    formData.set('description', description.trim())
    formData.set('parentId', parentId ?? '')

    startTransition(async () => {
      const result = isEditing
        ? await updateCategory(category!.id, formData)
        : await createCategory(formData)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? 'แก้ไขหมวดหมู่สำเร็จ' : 'เพิ่มหมวดหมู่สำเร็จ')
      onOpenChange(false)
      router.refresh()
    })
  }

  const availableParents = getAvailableParents()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'แก้ไขข้อมูลหมวดหมู่หนังสือ'
              : 'กรอกข้อมูลเพื่อสร้างหมวดหมู่หนังสือใหม่'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cat-name">ชื่อหมวดหมู่</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="เช่น นิยาย, สารคดี, การ์ตูน"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-friendly-slug"
              required
            />
            <p className="text-xs text-muted-foreground">
              ใช้ใน URL สร้างอัตโนมัติจากชื่อ แก้ไขได้
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="cat-desc">รายละเอียด</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายหมวดหมู่ (ไม่บังคับ)"
              rows={2}
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label>หมวดหมู่หลัก</Label>
            <Select
              value={parentId ?? ''}
              onValueChange={(val) => setParentId(val === '' ? null : (val as string))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ไม่มี (หมวดหมู่หลัก)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  ไม่มี (หมวดหมู่หลัก)
                </SelectItem>
                {availableParents.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              เลือกหมวดหมู่หลักเพื่อสร้างเป็นหมวดหมู่ย่อย
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'กำลังบันทึก...'
                : isEditing
                  ? 'บันทึกการแก้ไข'
                  : 'เพิ่มหมวดหมู่'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// CategoryItem (single row in the tree)
// ---------------------------------------------------------------------------

interface CategoryItemProps {
  category: CategoryNode
  depth: number
  flatCategories: BookCategory[]
  onEdit: (category: BookCategory) => void
}

function CategoryItem({
  category,
  depth,
  flatCategories,
  onEdit,
}: CategoryItemProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDeleting, startDeleteTransition] = useTransition()
  const hasChildren = category.children && category.children.length > 0

  function handleDelete() {
    const confirmed = window.confirm(
      `คุณต้องการลบหมวดหมู่ "${category.name}" ใช่หรือไม่?\n\nหากมีหมวดหมู่ย่อย จะถูกย้ายไปยังระดับบน`
    )
    if (!confirmed) return

    startDeleteTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(`ลบหมวดหมู่ "${category.name}" สำเร็จ`)
      router.refresh()
    })
  }

  return (
    <div>
      {/* Row */}
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
      >
        {/* Expand / collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}

        {/* Folder icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="size-4 shrink-0 text-amber-500" />
        ) : (
          <Folder className="size-4 shrink-0 text-muted-foreground" />
        )}

        {/* Name & slug */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="font-medium truncate">{category.name}</span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            /{category.slug}
          </span>
        </div>

        {/* Description (if any) */}
        {category.description && (
          <span className="hidden md:inline text-xs text-muted-foreground truncate max-w-48">
            {category.description}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(category)}
            title="แก้ไข"
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            disabled={isDeleting}
            title="ลบ"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <CategoryTree
          categories={category.children!}
          depth={depth + 1}
          flatCategories={flatCategories}
          onEdit={onEdit}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategoryTree (recursive list)
// ---------------------------------------------------------------------------

interface CategoryTreeProps {
  categories: CategoryNode[]
  depth: number
  flatCategories: BookCategory[]
  onEdit: (category: BookCategory) => void
}

function CategoryTree({
  categories,
  depth,
  flatCategories,
  onEdit,
}: CategoryTreeProps) {
  return (
    <div>
      {categories.map((cat) => (
        <CategoryItem
          key={cat.id}
          category={cat}
          depth={depth}
          flatCategories={flatCategories}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CategoryManager (main exported component)
// ---------------------------------------------------------------------------

export function CategoryManager({
  categories,
  flatCategories,
}: CategoryManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(
    null
  )

  function handleAdd() {
    setEditingCategory(null)
    setDialogOpen(true)
  }

  function handleEdit(category: BookCategory) {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          ทั้งหมด {flatCategories.length} หมวดหมู่
        </p>
        <Button onClick={handleAdd} size="sm">
          <Plus className="size-4" data-icon="inline-start" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>โครงสร้างหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="size-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                ยังไม่มีหมวดหมู่
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                เริ่มต้นเพิ่มหมวดหมู่เพื่อจัดระเบียบหนังสือในร้าน
              </p>
              <Button onClick={handleAdd} variant="outline" size="sm" className="mt-4">
                <Plus className="size-4" data-icon="inline-start" />
                เพิ่มหมวดหมู่แรก
              </Button>
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              depth={0}
              flatCategories={flatCategories}
              onEdit={handleEdit}
            />
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        flatCategories={flatCategories}
      />
    </div>
  )
}
