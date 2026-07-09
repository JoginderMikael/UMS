import type { AboutCard } from '../../constants/homeContent'

type AboutSectionProps = {
  cards: AboutCard[]
}

function AboutSection({ cards }: AboutSectionProps) {
  const aboutDescription = cards.find((card) => card.id === 'about-description')
  const aboutCourses = cards.find((card) => card.id === 'about-courses')
  const vision = cards.find((card) => card.id === 'about-vision')
  const mission = cards.find((card) => card.id === 'about-mission')

  return (
    <section
      id="about-section"
      className="bg-linear-to-b from-slate-100 via-white to-slate-50 px-4 py-16 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700/70">About AHU</p>
          <h2 className="mt-3 text-3xl font-bold text-[#0b3c5d] md:text-5xl">
            About Aura Heights University
          </h2>
          <p className="mt-4 text-slate-600 md:text-lg">
            A future-focused institution combining academic excellence, innovation, and
            practical learning for the next generation of leaders.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
          <article className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/60 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700/70">Who We Are</p>

            {aboutDescription?.paragraphs?.map((paragraph, index) => (
              <p
                key={`about-description-${index}`}
                className={`${index === 0 ? 'mt-5' : 'mt-4'} leading-8 text-slate-700 md:text-[1.05rem]`}
              >
                {paragraph}
              </p>
            ))}

            {aboutCourses?.paragraphs?.map((paragraph, index) => (
              <p
                key={`about-courses-${index}`}
                className="mt-5 leading-8 text-slate-700 md:text-[1.05rem]"
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
                STEM Excellence
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800">
                Industry-Ready Skills
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-800">
                Global Leadership
              </div>
            </div>
          </article>

          <aside className="space-y-5">
            <article className="rounded-3xl border border-white/40 bg-linear-to-br from-[#0b3c5d] to-sky-700 p-7 text-white shadow-xl shadow-sky-900/20 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/90">Our Vision</p>
              <h3 className="mt-3 text-2xl font-semibold">{vision?.title}</h3>
              <p className="mt-4 leading-7 text-sky-50/95">{vision?.paragraphs?.[0]}</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-slate-900 p-7 text-white shadow-xl shadow-slate-900/20 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Our Mission</p>
              <h3 className="mt-3 text-2xl font-semibold">{mission?.title}</h3>
              <p className="mt-4 leading-7 text-slate-200">{mission?.paragraphs?.[0]}</p>
            </article>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default AboutSection