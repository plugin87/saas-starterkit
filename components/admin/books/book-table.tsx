'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '@/components/shared/data-table/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deactivateBook } from '@/actions/books'

interface BookRow {
  id: string
  title: string
  author: string
  isbn: string | null
  publisher: string | null
  price: number
  cost_price: number | null
  stock_quantity: number
  low_stock_threshold: number
  cover_image_url: string | null
  category_id: string | null
  tags: string[]
  is_active: boolean
  created_at: string
  book_categories: { id: string; name: string } | null
}

interface BookTableProps {
  data: BookRow[]
  categories: { id: string; name: string }[]
}

function StockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity === 0) {
    return <Badge variant="destructive">หมด</Badge>
  }
  if (quantity <= threshold) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
        ต่ำ ({quantity})
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
      {quantity}
    </Badge>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

function ActionsCell({ row }: { row: BookRow }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeactivate() {
    setIsDeleting(true)
    const result = await deactivateBook(row.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('ลบหนังสือเรียบร้อยแล้ว')
    }
    setIsDeleting(false)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">เปิดเมนู</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/admin/books/${row.id}`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            ดู/แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบหนังสือ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบหนังสือ &ldquo;{row.title}&rdquo; ใช่หรือไม่?
              การดำเนินการนี้จะซ่อนหนังสือจากระบบ
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeleting}
            >
              {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function createColumns(): ColumnDef<BookRow, unknown>[] {
  return [
    {
      accessorKey: 'cover_image_url',
      header: 'ภาพปก',
      enableSorting: false,
      cell: ({ row }) => {
        const url = row.getValue('cover_image_url') as string | null
        return (
          <div className="h-[60px] w-[40px] overflow-hidden rounded-sm bg-muted">
            {url ? (
              <Image
                src={url}
                alt={row.original.title}
                width={40}
                height={60}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                ไม่มี
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ชื่อหนังสือ" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <Link
            href={`/admin/books/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.getValue('title')}
          </Link>
          {row.original.isbn && (
            <p className="text-xs text-muted-foreground">ISBN: {row.original.isbn}</p>
          )}
        </div>
      ),
      filterFn: (row, _id, filterValue: string) => {
        const search = filterValue.toLowerCase()
        const title = (row.original.title || '').toLowerCase()
        const author = (row.original.author || '').toLowerCase()
        const isbn = (row.original.isbn || '').toLowerCase()
        return title.includes(search) || author.includes(search) || isbn.includes(search)
      },
    },
    {
      accessorKey: 'author',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ผู้แต่ง" />
      ),
    },
    {
      accessorKey: 'category_id',
      header: 'หมวดหมู่',
      cell: ({ row }) => {
        const cat = row.original.book_categories
        return cat ? (
          <Badge variant="secondary">{cat.name}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        return row.original.category_id === filterValue
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ราคา" />
      ),
      cell: ({ row }) => formatPrice(row.getValue('price') as number),
    },
    {
      accessorKey: 'stock_quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="สต็อก" />
      ),
      cell: ({ row }) => (
        <StockBadge
          quantity={row.original.stock_quantity}
          threshold={row.original.low_stock_threshold}
        />
      ),
    },
    {
      id: 'actions',
      header: 'การดำเนินการ',
      cell: ({ row }) => <ActionsCell row={row.original} />,
    },
  ]
}

export function BookTable({ data, categories }: BookTableProps) {
  const columns = createColumns()

  const filterOptions = [
    {
      key: 'category_id',
      label: 'หมวดหมู่ทั้งหมด',
      options: categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="title"
      searchPlaceholder="ค้นหาหนังสือ (ชื่อ, ผู้แต่ง, ISBN)"
      filterOptions={filterOptions}
    />
  )
}
