function HeroCarousel({ images, activeImageIndex }) {
  return (
    <section className="relative h-[55vh] min-h-80 max-h-140 w-full overflow-hidden">
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
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-4 top-1/2 mx-auto max-w-2xl -translate-y-1/2 rounded-xl bg-black/55 p-6 text-center text-white backdrop-blur-sm md:p-8">
        <h1 className="text-3xl font-bold md:text-5xl">Welcome to Aura Heights University</h1>
        <p className="mt-3 text-base text-slate-100 md:text-lg">Empowering Minds. Shaping Futures.</p>
      </div>
    </section>
  )
}

export default HeroCarousel
