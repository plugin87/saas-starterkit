import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to ship your SaaS?</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Join hundreds of developers who have launched faster with this starter kit.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/register">Start Building Free</Link>
        </Button>
      </div>
    </section>
  )
}
