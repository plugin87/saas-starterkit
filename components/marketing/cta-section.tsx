import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/90 to-primary" />
      <div className="container text-center">
        <h2 className="text-3xl font-bold text-primary-foreground mb-4">
          พร้อมเริ่มสะสมแต้มแล้วหรือยัง?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">
          สมัครสมาชิกฟรี ไม่มีค่าใช้จ่าย
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/register">สมัครสมาชิกเลย</Link>
        </Button>
      </div>
    </section>
  )
}
