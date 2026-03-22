import { BookOpen } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <p>&copy; {new Date().getFullYear()} ร้านหนังสือ. สงวนลิขสิทธิ์.</p>
      </div>
    </footer>
  )
}
