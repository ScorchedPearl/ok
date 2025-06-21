import React, { useRef } from "react"
import Hero from "@/components/home/Hero"
import TrustSection from "@/components/home/TrustSection"
import FeatureSection from "@/components/home/FeatureSection"
import ExploreSection from "@/components/home/ExploreSection"
import VideoSection from "@/components/home/VideoSection"
import { ContactForm } from "@/components/home/ContactForm"
import { HomeFooter } from "@/components/home/HomeFooter"
import PricingSection from "@/components/home/PricingPlans"
import EnhancedHero from "@/components/home/EnhancedHero"
import AIShowcasePage from "@/components/home/AIShowcasePage"
import HeroToShowcaseBridge from "@/components/home/HeroToShowcaseBridge"
import WhyChoose from "@/components/home/WhyChoose"

const Home: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null)
  const PricingRef = useRef<HTMLDivElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToPricing = () => {
    PricingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <Hero onFeaturesClick={scrollToFeatures} onPricingClick={scrollToPricing} />
      {/* <TrustSection /> */}
      <HeroToShowcaseBridge/>
      <div ref={featuresRef}>
      <WhyChoose/>
        <FeatureSection />
      </div>


      <ExploreSection />

      <div ref = {PricingRef}>
      <PricingSection/>
      </div>

      <VideoSection />
      <ContactForm />
      <HomeFooter />
    </div>
  )
}

export default Home