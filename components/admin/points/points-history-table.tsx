'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/shared/data-table/data-table'
import { DataTableColumnHeader } from '@/components/shared/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPoints } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PointsTransaction {
  id: string
  type: 'earn' | 'redeem' | 'adjust' | 'expire'
  points: number
  balance_after: number
  description: string | null
  created_at: string
  member: {
    id: string
    name: string | null
    member_code: string | null
  } | null
  staff: {
    id: string
    name: string | null
  } | null
}

interface PointsHistoryTableProps {
  data: PointsTransaction[]
}

// ─── Type Badge Config ───────────────────────────────────────────────────────

const typeConfig: Record<string, { label: string; className: string }> = {
  earn: { label: 'ได้รับ', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' },
  redeem: { label: 'แลก', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' },
  adjust: { label: 'ปรับ', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' },
  expire: { label: 'หมดอายุ', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' },
}

function TypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] ?? typeConfig.adjust
  return (
    <Badge className={config.className} variant="secondary">
      {config.label}
    </Badge>
  )
}

// ─── Columns ─────────────────────────────────────────────────────────────────

function createColumns(): ColumnDef<PointsTransaction, unknown>[] {
  return [
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="วันที่" />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.getValue('created_at') as string)}
        </span>
      ),
    },
    {
      id: 'member_name',
      header: 'สมาชิก',
      enableSorting: false,
      cell: ({ row }) => {
        const member = row.original.member
        if (!member) return <span className="text-muted-foreground">-</span>
        return (
          <div>
            <p className="font-medium text-sm">{member.name || '-'}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {member.member_code || '-'}
            </p>
          </div>
        )
      },
      filterFn: (row, _id, filterValue: string) => {
        const search = filterValue.toLowerCase()
        const name = (row.original.member?.name || '').toLowerCase()
        const code = (row.original.member?.member_code || '').toLowerCase()
        return name.includes(search) || code.includes(search)
      },
    },
    {
      accessorKey: 'type',
      header: 'ประเภท',
      enableSorting: false,
      cell: ({ row }) => <TypeBadge type={row.getValue('type') as string} />,
      filterFn: (row, _id, filterValue: string) => {
        if (!filterValue) return true
        return row.original.type === filterValue
      },
    },
    {
      accessorKey: 'points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="คะแนน" />
      ),
      cell: ({ row }) => {
        const points = row.getValue('points') as number
        const isPositive = points > 0
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{new Intl.NumberFormat('th-TH').format(points)}
          </span>
        )
      },
    },
    {
      accessorKey: 'balance_after',
      header: 'คงเหลือ',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">
          {formatPoints(row.getValue('balance_after') as number)}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'รายละเอียด',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
          {row.getValue('description') || '-'}
        </span>
      ),
    },
    {
      id: 'staff_name',
      header: 'โดย',
      enableSorting: false,
      cell: ({ row }) => {
        const staff = row.original.staff
        return (
          <span className="text-sm text-muted-foreground">
            {staff?.name || 'ระบบ'}
          </span>
        )
      },
    },
  ]
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PointsHistoryTable({ data }: PointsHistoryTableProps) {
  const columns = createColumns()

  const filterOptions = [
    {
      key: 'type',
      label: 'ประเภททั้งหมด',
      options: [
        { label: 'ได้รับ', value: 'earn' },
        { label: 'แลก', value: 'redeem' },
        { label: 'ปรับ', value: 'adjust' },
        { label: 'หมดอายุ', value: 'expire' },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="member_name"
      searchPlaceholder="ค้นหาสมาชิก (ชื่อ, รหัส)"
      filterOptions={filterOptions}
    />
  )
}
