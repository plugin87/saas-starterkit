import { BillingInfo } from '@/components/dashboard/billing-info'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Billing' }

export default function BillingPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing.</p>
      </div>
      <BillingInfo />
    </div>
  )
}
