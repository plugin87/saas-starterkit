import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

interface PopularBook {
  id: string
  title: string
  author: string
  cover_image_url: string | null
  total_sold: number
}

interface PopularBooksProps {
  data: PopularBook[]
}

export function PopularBooks({ data }: PopularBooksProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>หนังสือขายดี</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลหนังสือขายดี</p>
        ) : (
          <div className="space-y-4">
            {data.map((book, index) => (
              <div
                key={book.id}
                className="flex items-center gap-3"
              >
                <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded">
                  {book.cover_image_url ? (
                    <Image
                      src={book.cover_image_url}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{book.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </p>
                </div>
                <p className="flex-shrink-0 text-sm font-semibold">
                  {book.total_sold.toLocaleString('th-TH')} เล่ม
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
