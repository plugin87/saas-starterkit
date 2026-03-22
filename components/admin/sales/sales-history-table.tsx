'use client'

import { type ColumnDef } from '@tanstack/react-table'

import { DataTable } from '@/components/shared/data-table/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatPoints } from '@/lib/utils'
import { th } from '@/lib/th'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SaleRow {
  id: string
  member_id: string | null
  staff_id: string
  subtotal: number
  discount_amount: number
  points_redeemed: number
  points_discount: number
  total: number
  points_earned: number
  payment_method: 'cash' | 'card' | 'transfer' | 'qr'
  note: string | null
  created_at: string
  member: { id: string; name: string; member_code: string } | null
  staff: { id: string; name: string } | null
}

interface SalesHistoryTableProps {
  data: SaleRow[]
}

// ─── Payment Method Labels ───────────────────────────────────────────────────

const paymentMethodLabels: Record<string, string> = {
  cash: th.sale.cash,
  card: th.sale.card,
  transfer: th.sale.transfer,
  qr: th.sale.qr,
}

const paymentMethodColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  card: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  transfer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  qr: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
}

// ─── Columns ─────────────────────────────────────────────────────────────────

function createColumns(): ColumnDef<SaleRow, unknown>[] {
  return [
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="วันที่" />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">
          {formatDate(row.getValue('created_at') as string)}
        </span>
      ),
    },
    {
      accessorKey: 'member',
      header: 'สมาชิก',
      enableSorting: false,
      cell: ({ row }) => {
        const member = row.original.member
        if (!member) {
          return (
            <span className="text-muted-foreground">ลูกค้าทั่วไป</span>
          )
        }
        return (
          <div>
            <p className="font-medium text-sm">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.member_code}</p>
          </div>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        const search = filterValue.toLowerCase()
        const memberName = (row.original.member?.name || 'ลูกค้าทั่วไป').toLowerCase()
        const memberCode = (row.original.member?.member_code || '').toLowerCase()
        return memberName.includes(search) || memberCode.includes(search)
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ยอดรวม" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold">{formatCurrency(row.getValue('total') as number)}</span>
      ),
    },
    {
      id: 'discount',
      header: 'ส่วนลด',
      enableSorting: false,
      cell: ({ row }) => {
        const discountAmount = row.original.discount_amount
        const pointsDiscount = row.original.points_discount
        const totalDiscount = discountAmount + pointsDiscount
        if (totalDiscount === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return (
          <span className="text-green-600">-{formatCurrency(totalDiscount)}</span>
        )
      },
    },
    {
      accessorKey: 'points_earned',
      header: 'คะแนนได้รับ',
      enableSorting: false,
      cell: ({ row }) => {
        const points = row.getValue('points_earned') as number
        if (points === 0) {
          return <span className="text-muted-foreground">-</span>
        }
        return <span className="text-blue-600">{formatPoints(points)}</span>
      },
    },
    {
      accessorKey: 'payment_method',
      header: 'วิธีชำระ',
      enableSorting: false,
      cell: ({ row }) => {
        const method = row.getValue('payment_method') as string
        return (
          <Badge className={paymentMethodColors[method] ?? ''} variant="secondary">
            {paymentMethodLabels[method] ?? method}
          </Badge>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        return row.original.payment_method === filterValue
      },
    },
    {
      id: 'staff',
      header: 'พนักงาน',
      enableSorting: false,
      cell: ({ row }) => {
        const staff = row.original.staff
        return staff ? (
          <span className="text-sm">{staff.name}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
  ]
}

// ─── SalesHistoryTable Component ─────────────────────────────────────────────

export function SalesHistoryTable({ data }: SalesHistoryTableProps) {
  const columns = createColumns()

  const filterOptions = [
    {
      key: 'payment_method',
      label: 'วิธีชำระทั้งหมด',
      options: [
        { label: th.sale.cash, value: 'cash' },
        { label: th.sale.card, value: 'card' },
        { label: th.sale.transfer, value: 'transfer' },
        { label: th.sale.qr, value: 'qr' },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="member"
      searchPlaceholder="ค้นหาตามชื่อสมาชิก หรือรหัสสมาชิก"
      filterOptions={filterOptions}
    />
  )
}
