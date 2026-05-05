import { motion } from 'framer-motion';
import { TrackedLink as Link } from '@/components/TrackedLink';
import {
  showEpisodeSeeds,
  showFeaturedEpisode,
  showFormatPoints,
  showGuardrails,
  showHero,
} from '@/content/siteContent';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function ShowPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <motion.div {...fade(0.02)} className="overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.24)' }}>
            <img
              src={showHero.image}
              alt={showHero.title}
              className="w-full h-full object-cover"
              style={{ minHeight: '320px', filter: 'sepia(0.28) contrast(1.08) brightness(0.74)' }}
            />
          </motion.div>
          <div>
            <motion.p
              {...fade(0)}
              className="uppercase tracking-widest text-xs mb-5"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
            >
              {showHero.eyebrow}
            </motion.p>
            <motion.h1
              {...fade(0.08)}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
            >
              {showHero.title}
            </motion.h1>
            <motion.p
              {...fade(0.16)}
              className="text-lg max-w-3xl leading-relaxed"
              style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
            >
              {showHero.description} It lets people feel the voice of the brand before they ever
              book, enroll, or join a gathering.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <motion.div {...fade()}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
              Flagship Episode Direction
            </p>
            <h2 className="mb-4" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.2rem' }}>
              {showFeaturedEpisode.title}
            </h2>
            <p className="mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#8B5E3C', fontSize: '12px', letterSpacing: '0.08em' }}>
              {showFeaturedEpisode.focus} · {showFeaturedEpisode.runtime}
            </p>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
              {showFeaturedEpisode.description}
            </p>
            <div className="mt-6">
              <Link
                to={showFeaturedEpisode.ctaPath}
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
                eventName="show_featured_episode_cta_clicked"
                trackingContext="show_featured_episode"
                trackingLabel={showFeaturedEpisode.title}
              >
                {showFeaturedEpisode.ctaLabel}
              </Link>
            </div>
          </motion.div>

          <motion.div {...fade(0.08)} className="overflow-hidden" style={{ border: '1px solid #8B5E3C' }}>
            <img
              src={showFeaturedEpisode.image}
              alt={showFeaturedEpisode.title}
              className="w-full h-full object-cover"
              style={{ minHeight: '360px', filter: 'sepia(0.32) contrast(1.08) brightness(0.8)' }}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div {...fade()}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
              Role in the System
            </p>
            <h2 className="mb-4" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.2rem' }}>
              The low-friction entry point.
            </h2>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
              The show should not behave like separate content marketing. It should function as the
              editorial expression of the doctrine: the chair as sanctuary, the conversation as
              restoration, and the takeaway as a bridge into deeper work.
            </p>
          </motion.div>

          <motion.div {...fade(0.08)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#704214', letterSpacing: '0.2em' }}>
              Audience Job
            </p>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#2C1810', lineHeight: 1.85 }}>
              For the visitor who is not ready to buy or book yet, the show answers a simpler
              question: what does this worldview feel like in action?
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: '#E8DCBE' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div {...fade()} className="p-6" style={{ backgroundColor: '#F5ECD7', border: '1px solid #8B5E3C' }}>
            <h2 className="mb-5" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.9rem' }}>
              Recommended format
            </h2>
            <div className="space-y-3">
              {showFormatPoints.map((point, index) => (
                <div key={point} className="flex gap-3">
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#C9A84C', flexShrink: 0 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.08)} className="p-6" style={{ backgroundColor: '#2C1810', borderLeft: '4px solid #C9A84C' }}>
            <h2 className="mb-5" style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7', fontSize: '1.9rem' }}>
              Editorial guardrails
            </h2>
            <div className="space-y-3">
              {showGuardrails.map((point) => (
                <p key={point} style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.8 }}>
                  {point}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade()}
            className="uppercase tracking-widest text-xs mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}
          >
            Episode Seeds
          </motion.p>
          <motion.h2 {...fade(0.08)} className="mb-8" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.2rem' }}>
            Sample editorial directions.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {showEpisodeSeeds.map((episode, index) => (
              <motion.div key={episode.title} {...fade(index * 0.06)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
                <p className="uppercase tracking-widest text-xs mb-3" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.14em' }}>
                  {episode.format}
                </p>
                <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.35rem' }}>
                  {episode.title}
                </h3>
                <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                  {episode.takeaway}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.p
            {...fade()}
            className="uppercase tracking-widest text-xs mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}
          >
            Where it should lead
          </motion.p>
          <motion.h2 {...fade(0.08)} className="mb-5" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.3rem' }}>
            Watch, then choose the next depth.
          </motion.h2>
          <motion.p {...fade(0.16)} className="max-w-3xl mx-auto mb-8" style={{ fontFamily: '"Libre Baskerville", serif', color: '#704214', lineHeight: 1.85 }}>
            The show should point people into the right next step: book a session, enter the
            Academy, or join a live gathering. It is the invitation, not the whole journey.
          </motion.p>
          <motion.div {...fade(0.24)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Start with the Chair
            </Link>
            <Link to="/academy" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Enter the Academy
            </Link>
            <Link to="/events" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Join a Gathering
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}