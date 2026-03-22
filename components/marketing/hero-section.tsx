import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36">
      <div className="container relative z-10 text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          ร้านหนังสือที่ใส่ใจ
          <span className="text-primary">ทุกการอ่าน</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          สมัครสมาชิกวันนี้ สะสมแต้ม รับส่วนลด และค้นพบหนังสือที่คุณจะชอบ
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg">สมัครสมาชิก</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">เข้าสู่ระบบ</Button>
          </Link>
        </div>
      </div>
      {/* Decorative background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    </section>
  )
}
