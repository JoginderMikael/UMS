import { useEffect, useMemo, useState } from 'react'
import campusOne from '../assets/campus1.png'
import campusTwo from '../assets/campus2.jpg'
import campusThree from '../assets/campus3.jpg'
import AboutSection from '../components/home/AboutSection'
import HeroCarousel from '../components/home/HeroCarousel'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import { aboutCards, homeStats, navItems } from '../constants/homeContent'
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

      <main className="pt-18 md:pt-17">
        <HeroCarousel images={carouselImages} activeImageIndex={activeImageIndex} />

        <section className="relative z-10 -mt-12 px-4 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl shadow-slate-300/40 backdrop-blur-sm md:grid-cols-4 md:p-5">
            {homeStats.map((item) => (
              <article key={item.label} className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-extrabold text-[#0b3c5d]">{item.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  {item.label}
                </p>
              </article>
            ))}
          </div>
        </section>

        <AboutSection cards={aboutCards} />
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
