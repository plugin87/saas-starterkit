import { HeroSection } from '@/components/marketing/hero-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { CTASection } from '@/components/marketing/cta-section'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
