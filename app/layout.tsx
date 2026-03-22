import type { Metadata } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/shared/query-provider'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: {
    default: 'ระบบจัดการสมาชิกร้านหนังสือ',
    template: `%s | ระบบจัดการสมาชิกร้านหนังสือ`,
  },
  description: 'ระบบจัดการสมาชิกและคลังหนังสือ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${inter.className} ${notoSansThai.className}`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
