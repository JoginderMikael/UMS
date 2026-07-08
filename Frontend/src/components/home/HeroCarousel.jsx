function HeroCarousel({ images, activeImageIndex }) {
  return (
    <section className="relative h-[72vh] min-h-96 max-h-190 w-full overflow-hidden">
      {images.map((image, index) => (
        <img
          key={image.alt}
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            activeImageIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 via-slate-900/55 to-sky-950/45" />

      <div className="absolute inset-x-4 top-1/2 mx-auto max-w-3xl -translate-y-1/2 rounded-2xl border border-white/20 bg-black/35 p-6 text-center text-white shadow-2xl shadow-black/30 backdrop-blur-sm md:p-10">
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-100">
          Enrollment Open • 2026 Intake
        </p>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Welcome to Aura Heights University
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-100/95 md:text-lg">
          Empowering Minds. Shaping Futures. Discover modern learning spaces, diverse
          programs, and a student experience designed for real-world impact.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/login"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
          >
            Login to Portal
          </a>
          <a
            href="#about-section"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Explore University
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {images.map((image, index) => (
          <span
            key={`${image.alt}-dot`}
            className={`h-2.5 rounded-full transition-all ${
              activeImageIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroCarousel
