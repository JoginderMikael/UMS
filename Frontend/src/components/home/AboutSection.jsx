function AboutSection({ cards }) {
  return (
    <section className="bg-slate-100 px-4 py-14 md:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold text-[#0b3c5d] md:text-4xl">
          About Aura Heights University
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {card.title ? <h3 className="text-xl font-semibold text-[#0b3c5d]">{card.title}</h3> : null}
              {card.paragraphs.map((paragraph, index) => (
                <p key={`${card.id}-${index}`} className={`${index === 0 && card.title ? 'mt-3' : index > 0 ? 'mt-4' : ''} leading-7 text-slate-700`}>
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutSection
