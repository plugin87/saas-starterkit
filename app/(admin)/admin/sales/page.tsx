import { PosInterface } from '@/components/admin/sales/pos-interface'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'บันทึกการขาย' }

export default function SalesPage() {
  return <PosInterface />
}
