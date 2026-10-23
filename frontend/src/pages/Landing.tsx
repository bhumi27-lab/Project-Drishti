import { LandingNav } from '@/features/landing/LandingNav'
import { HeroEye } from '@/features/landing/eye/HeroEye'
import { FooterCta } from '@/features/landing/sections/FooterCta'
import { HowItWorks } from '@/features/landing/sections/HowItWorks'
import { WhyLocal } from '@/features/landing/sections/WhyLocal'
import { useLenis } from '@/features/landing/useLenis'

const still = import.meta.env.DEV && new URLSearchParams(window.location.search).has('still')

export default function Landing() {
  useLenis()
  return (
    <div className="min-h-screen bg-bg">
      {!still && <LandingNav />}
      <main>
        <HeroEye />
        <HowItWorks />
        <WhyLocal />
      </main>
      <FooterCta />
    </div>
  )
}
