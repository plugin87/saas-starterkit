import { Star, TrendingUp, Tag, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Star,
    title: 'สะสมแต้มทุกการซื้อ',
    description: 'ซื้อหนังสือ 1 บาท = 1 แต้ม แลกเป็นส่วนลดได้ทันที',
  },
  {
    icon: TrendingUp,
    title: 'เลื่อนระดับอัตโนมัติ',
    description: 'ยิ่งซื้อมาก ยิ่งได้สิทธิพิเศษ Silver → Gold → Platinum',
  },
  {
    icon: Tag,
    title: 'โปรโมชั่นพิเศษ',
    description: 'รับส่วนลดและโปรโมชั่นเฉพาะสมาชิกก่อนใคร',
  },
  {
    icon: BookOpen,
    title: 'แนะนำหนังสือเพื่อคุณ',
    description: 'ระบบแนะนำหนังสือจากประวัติการซื้อของคุณ',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-4">
          สิทธิพิเศษสำหรับสมาชิก
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          เป็นสมาชิกร้านหนังสือ รับสิทธิประโยชน์มากมายที่คุ้มค่าทุกการซื้อ
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="text-center">
                <CardContent className="flex flex-col items-center pt-2">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
