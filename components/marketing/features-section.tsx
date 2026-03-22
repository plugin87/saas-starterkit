import { Shield, Zap, BarChart } from 'lucide-react'

const features = [
  { icon: Shield, title: 'Secure by Default', description: 'Auth, RLS, and security best practices built in from the start.' },
  { icon: Zap, title: 'Lightning Fast', description: 'Built with Next.js App Router and optimized for production.' },
  { icon: BarChart, title: 'Analytics Ready', description: 'Track usage, conversions, and revenue out of the box.' },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/40">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to ship</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex flex-col items-center text-center p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
