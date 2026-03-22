'use client'

import { createCheckoutSession, createPortalSession } from '@/actions/billing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANS, formatCurrency } from '@/lib/stripe'
import { CreditCard } from 'lucide-react'

// TODO: receive real subscription data via props
export function BillingInfo() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </div>
            <Badge>Free</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock unlimited projects, advanced analytics, and priority support.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['PRO', 'TEAM'] as const).map((key) => (
              <Card key={key} className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{PLANS[key].name}</CardTitle>
                  <p className="text-2xl font-bold">{formatCurrency(PLANS[key].price)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={key === 'PRO' ? 'default' : 'outline'}
                    onClick={() => createCheckoutSession(key)}
                  >
                    Upgrade to {PLANS[key].name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => createPortalSession()}>
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Billing
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
