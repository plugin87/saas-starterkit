'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '@/components/shared/data-table/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TierBadge } from '@/components/shared/tier-badge'
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
import { deactivatePromotion } from '@/actions/promotions'
import { formatDate } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  percent_discount: 'ลดเปอร์เซ็นต์',
  fixed_discount: 'ลดราคาคงที่',
  buy_x_get_y: 'ซื้อ X แถม Y',
  spend_threshold: 'ซื้อครบ X ได้ Y',
  bundle: 'ชุดหนังสือ',
  points_multiplier: 'คูณคะแนน',
}

interface PromotionRow {
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
  created_at: string
}

interface PromotionTableProps {
  data: PromotionRow[]
}

function getStatusInfo(row: PromotionRow): { label: string; className: string } {
  const now = new Date()
  const startsAt = new Date(row.starts_at)
  const endsAt = new Date(row.ends_at)

  if (!row.is_active || now > endsAt) {
    return {
      label: 'สิ้นสุด',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
  }
  if (now < startsAt) {
    return {
      label: 'รอเริ่ม',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    }
  }
  return {
    label: 'กำลังใช้งาน',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  }
}

function ActionsCell({ row }: { row: PromotionRow }) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  async function handleDeactivate() {
    setIsDeactivating(true)
    const result = await deactivatePromotion(row.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('ปิดการใช้งานโปรโมชั่นเรียบร้อยแล้ว')
    }
    setIsDeactivating(false)
    setShowDeactivateDialog(false)
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
            render={<Link href={`/admin/promotions/${row.id}`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            ดู/แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowDeactivateDialog(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            ปิดการใช้งาน
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการปิดโปรโมชั่น</DialogTitle>
            <DialogDescription>
              คุณต้องการปิดการใช้งานโปรโมชั่น &ldquo;{row.name}&rdquo; ใช่หรือไม่?
              การดำเนินการนี้จะหยุดโปรโมชั่นทันที
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={isDeactivating}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={isDeactivating}
            >
              {isDeactivating ? 'กำลังดำเนินการ...' : 'ยืนยันปิดการใช้งาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function createColumns(): ColumnDef<PromotionRow, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ชื่อ" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/admin/promotions/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue('name')}
        </Link>
      ),
      filterFn: (row, _id, filterValue: string) => {
        const search = filterValue.toLowerCase()
        const name = (row.original.name || '').toLowerCase()
        const desc = (row.original.description || '').toLowerCase()
        return name.includes(search) || desc.includes(search)
      },
    },
    {
      accessorKey: 'type',
      header: 'ประเภท',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant="secondary">
            {typeLabels[type] ?? type}
          </Badge>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        return row.original.type === filterValue
      },
    },
    {
      accessorKey: 'min_tier',
      header: 'ระดับขั้นต่ำ',
      cell: ({ row }) => {
        const tier = row.getValue('min_tier') as string | null
        if (!tier) {
          return <span className="text-muted-foreground">ทุกระดับ</span>
        }
        return <TierBadge tier={tier} />
      },
    },
    {
      id: 'period',
      header: 'ช่วงเวลา',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDate(row.original.starts_at)}</div>
          <div className="text-muted-foreground">ถึง {formatDate(row.original.ends_at)}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'สถานะ',
      cell: ({ row }) => {
        const status = getStatusInfo(row.original)
        return (
          <Badge className={status.className} variant="secondary">
            {status.label}
          </Badge>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        const status = getStatusInfo(row.original)
        return status.label === filterValue
      },
    },
    {
      id: 'usage',
      header: 'ใช้ไปแล้ว',
      cell: ({ row }) => {
        const { used_count, max_uses } = row.original
        if (max_uses) {
          return (
            <span className="text-sm">
              {used_count} / {max_uses}
            </span>
          )
        }
        return (
          <span className="text-sm">
            {used_count} / <span className="text-muted-foreground">ไม่จำกัด</span>
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'การดำเนินการ',
      cell: ({ row }) => <ActionsCell row={row.original} />,
    },
  ]
}

export function PromotionTable({ data }: PromotionTableProps) {
  const columns = createColumns()

  const filterOptions = [
    {
      key: 'status',
      label: 'ทั้งหมด',
      options: [
        { label: 'กำลังใช้งาน', value: 'กำลังใช้งาน' },
        { label: 'รอเริ่ม', value: 'รอเริ่ม' },
        { label: 'สิ้นสุด', value: 'สิ้นสุด' },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="ค้นหาโปรโมชั่น (ชื่อ, รายละเอียด)"
      filterOptions={filterOptions}
    />
  )
}
