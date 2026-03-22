import { PLANS } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export function PricingSection() {
  return (
    <section className="py-24 container">
      <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
      <p className="text-center text-muted-foreground mb-12">Start free, scale as you grow</p>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card key={key} className={key === 'PRO' ? 'border-primary shadow-lg' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                </span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={key === 'PRO' ? 'default' : 'outline'} asChild>
                <Link href="/register">{plan.price === 0 ? 'Get Started' : 'Start Free Trial'}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
