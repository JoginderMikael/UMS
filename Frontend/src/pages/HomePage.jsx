import { useEffect, useMemo, useState } from 'react'
import campusOne from '../assets/campus1.png'
import campusTwo from '../assets/campus2.jpg'
import campusThree from '../assets/campus3.jpg'
import AboutSection from '../components/home/AboutSection'
import HeroCarousel from '../components/home/HeroCarousel'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { aboutCards, navItems } from '../constants/homeContent'
import { resolveUserNavState } from '../utils/session'

const carouselImages = [
  { src: campusOne, alt: 'Aura Heights campus frontage' },
  { src: campusTwo, alt: 'Aura Heights students around campus' },
  { src: campusThree, alt: 'Aura Heights university facilities' },
]

function HomePage() {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((previousIndex) => (previousIndex + 1) % carouselImages.length)
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [])

  const userNavState = useMemo(() => resolveUserNavState(), [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar navItems={navItems} {...userNavState} />

      <main className="pt-22 md:pt-21">
        <HeroCarousel images={carouselImages} activeImageIndex={activeImageIndex} />
        <AboutSection cards={aboutCards} />
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
