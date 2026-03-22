'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Pencil, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '@/components/shared/data-table/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { TierBadge } from '@/components/shared/tier-badge'
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
import { deactivateMember, reactivateMember } from '@/actions/members'
import { formatCurrency, formatPoints } from '@/lib/utils'

interface MemberRow {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  member_code: string | null
  membership_tier: string
  available_points: number
  total_spent: number
  is_active: boolean
  created_at: string
}

interface MemberTableProps {
  data: MemberRow[]
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">
        ใช้งาน
      </Badge>
    )
  }
  return (
    <Badge variant="destructive">ระงับ</Badge>
  )
}

function ActionsCell({ row }: { row: MemberRow }) {
  const [showDialog, setShowDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  async function handleToggleStatus() {
    setIsProcessing(true)
    const action = row.is_active ? deactivateMember : reactivateMember
    const result = await action(row.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        row.is_active ? 'ระงับสมาชิกเรียบร้อยแล้ว' : 'เปิดใช้งานสมาชิกเรียบร้อยแล้ว'
      )
    }
    setIsProcessing(false)
    setShowDialog(false)
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
            render={<Link href={`/admin/members/${row.id}`} />}
          >
            <Eye className="mr-2 h-4 w-4" />
            ดูรายละเอียด
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href={`/admin/members/${row.id}`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            แก้ไข
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={row.is_active ? 'destructive' : undefined}
            onClick={() => setShowDialog(true)}
          >
            {row.is_active ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                ระงับ
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                เปิดใช้งาน
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {row.is_active ? 'ยืนยันการระงับสมาชิก' : 'ยืนยันการเปิดใช้งาน'}
            </DialogTitle>
            <DialogDescription>
              {row.is_active
                ? `คุณต้องการระงับสมาชิก "${row.name}" ใช่หรือไม่? สมาชิกจะไม่สามารถเข้าสู่ระบบได้`
                : `คุณต้องการเปิดใช้งานสมาชิก "${row.name}" อีกครั้งใช่หรือไม่?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isProcessing}
            >
              ยกเลิก
            </Button>
            <Button
              variant={row.is_active ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={isProcessing}
            >
              {isProcessing
                ? 'กำลังดำเนินการ...'
                : row.is_active
                  ? 'ยืนยันระงับ'
                  : 'ยืนยันเปิดใช้งาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function createColumns(): ColumnDef<MemberRow, unknown>[] {
  return [
    {
      accessorKey: 'member_code',
      header: 'รหัสสมาชิก',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.getValue('member_code') || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ชื่อ-นามสกุล" />
      ),
      cell: ({ row }) => (
        <div>
          <Link
            href={`/admin/members/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.getValue('name') || '-'}
          </Link>
          {row.original.email && (
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
      filterFn: (row, _id, filterValue: string) => {
        const search = filterValue.toLowerCase()
        const name = (row.original.name || '').toLowerCase()
        const phone = (row.original.phone || '').toLowerCase()
        const memberCode = (row.original.member_code || '').toLowerCase()
        return (
          name.includes(search) ||
          phone.includes(search) ||
          memberCode.includes(search)
        )
      },
    },
    {
      accessorKey: 'phone',
      header: 'เบอร์โทร',
      enableSorting: false,
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'membership_tier',
      header: 'ระดับ',
      enableSorting: false,
      cell: ({ row }) => (
        <TierBadge tier={row.getValue('membership_tier') as string} />
      ),
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        return row.original.membership_tier === filterValue
      },
    },
    {
      accessorKey: 'available_points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="คะแนนสะสม" />
      ),
      cell: ({ row }) => formatPoints(row.getValue('available_points') as number),
    },
    {
      accessorKey: 'total_spent',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ยอดซื้อสะสม" />
      ),
      cell: ({ row }) => formatCurrency(row.getValue('total_spent') as number),
    },
    {
      accessorKey: 'is_active',
      header: 'สถานะ',
      enableSorting: false,
      cell: ({ row }) => (
        <StatusBadge isActive={row.getValue('is_active') as boolean} />
      ),
    },
    {
      id: 'actions',
      header: 'การดำเนินการ',
      cell: ({ row }) => <ActionsCell row={row.original} />,
    },
  ]
}

export function MemberTable({ data }: MemberTableProps) {
  const columns = createColumns()

  const filterOptions = [
    {
      key: 'membership_tier',
      label: 'ระดับทั้งหมด',
      options: [
        { label: 'ซิลเวอร์', value: 'silver' },
        { label: 'โกลด์', value: 'gold' },
        { label: 'แพลทินัม', value: 'platinum' },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="ค้นหาสมาชิก (ชื่อ, เบอร์โทร, รหัส)"
      filterOptions={filterOptions}
    />
  )
}
