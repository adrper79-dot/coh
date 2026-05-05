import { motion } from 'framer-motion';
import { TrackedLink as Link } from '@/components/TrackedLink';
import {
  founderBio,
  founderHero,
  founderMilestones,
  founderPrinciples,
} from '@/content/siteContent';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function FounderPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <motion.div {...fade(0.02)} className="overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.24)' }}>
            <img
              src={founderHero.image}
              alt={founderHero.title}
              className="w-full h-full object-cover"
              style={{ minHeight: '340px', filter: 'sepia(0.25) contrast(1.08) brightness(0.75)' }}
            />
          </motion.div>
          <div>
            <motion.p
              {...fade(0)}
              className="uppercase tracking-widest text-xs mb-5"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
            >
              {founderHero.eyebrow}
            </motion.p>
            <motion.h1
              {...fade(0.08)}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
            >
              {founderHero.title}
            </motion.h1>
            <motion.p
              {...fade(0.16)}
              className="text-lg max-w-3xl leading-relaxed"
              style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
            >
              {founderHero.description}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fade()}>
            <h2 className="mb-5" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.1rem' }}>
              Why this exists
            </h2>
            <div className="space-y-4" style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
              {founderBio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.08)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#704214', letterSpacing: '0.2em' }}>
              Founder Principles
            </p>
            <div className="space-y-3">
              {founderPrinciples.map((pillar) => (
                <p key={pillar} style={{ fontFamily: '"Libre Baskerville", serif', color: '#2C1810', lineHeight: 1.8 }}>
                  {pillar}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: '#E8DCBE' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade()}
            className="uppercase tracking-widest text-xs mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#704214', letterSpacing: '0.2em' }}
          >
            Founder Throughline
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {founderMilestones.map((milestone, index) => (
              <motion.div key={milestone.label} {...fade(index * 0.06)} className="p-6" style={{ backgroundColor: '#F5ECD7', border: '1px solid #8B5E3C' }}>
                <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.4rem' }}>
                  {milestone.label}
                </h3>
                <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                  {milestone.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: '#E8DCBE' }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fade()} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Read the Doctrine
            </Link>
            <Link to="/show" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Explore the Show
            </Link>
            <Link to="/booking" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Start with the Chair
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}