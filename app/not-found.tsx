import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">ไม่พบหน้าที่คุณกำลังมองหา</p>
      <Link href="/" className="mt-6">
        <Button>กลับหน้าแรก</Button>
      </Link>
    </div>
  )
}
