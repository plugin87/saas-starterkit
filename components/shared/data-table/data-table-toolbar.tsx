'use client'

import { type Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  filterOptions?: {
    key: string
    label: string
    options: { label: string; value: string }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  filterOptions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="h-9 w-[250px] lg:w-[350px]"
          />
        )}
        {filterOptions?.map((filter) => {
          const column = table.getColumn(filter.key)
          if (!column) return null
          const selectedValue = column.getFilterValue() as string
          return (
            <select
              key={filter.key}
              value={selectedValue ?? ''}
              onChange={(e) => column.setFilterValue(e.target.value || undefined)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3"
          >
            ล้างตัวกรอง
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
