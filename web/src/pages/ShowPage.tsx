import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { showEpisodeSeeds, showFormatPoints, showGuardrails } from '@/content/siteContent';

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
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade(0)}
            className="uppercase tracking-widest text-xs mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
          >
            The Show
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
          >
            The barber chair as a public front door.
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="text-lg max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
          >
            The show translates Cypher of Healing into a visible, shareable experience. It is where
            grooming, conversation, culture, and reflection meet in public view. It lets people feel
            the voice of the brand before they ever book, enroll, or join a gathering.
          </motion.p>
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
              {formatPoints.map((point, index) => (
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
              {guardrails.map((point) => (
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