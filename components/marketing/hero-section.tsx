import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="py-24 md:py-32 container text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
        Build your SaaS{' '}
        <span className="text-primary">faster than ever</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Everything you need to launch a production-ready SaaS. Auth, billing, and a beautiful dashboard — all included.
      </p>
      <div className="flex gap-4 justify-center">
        <Button size="lg" asChild><Link href="/register">Get Started Free</Link></Button>
        <Button size="lg" variant="outline" asChild><Link href="/pricing">View Pricing</Link></Button>
      </div>
    </section>
  )
}
