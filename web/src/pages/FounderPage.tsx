import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const pillars = [
  'Barbering as a ritual of care, precision, and presence.',
  'Healing as a process of decoding inherited patterns.',
  'Style and grooming as outward declarations of inner dignity.',
  'Education and community as the bridge between insight and practice.',
];

export default function FounderPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade(0)}
            className="uppercase tracking-widest text-xs mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
          >
            Founder Story
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
          >
            The work behind the work.
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="text-lg max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
          >
            Cypher of Healing is built on a founder vision that treats the chair as sanctuary,
            conversation as ritual, and restoration as something that should be culturally rooted,
            embodied, and teachable.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fade()}>
            <h2 className="mb-5" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.1rem' }}>
              Why this exists
            </h2>
            <div className="space-y-4" style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
              <p>
                Cypher of Healing starts from the recognition that people often begin restoration in
                trusted human spaces long before they begin it in formal institutions.
              </p>
              <p>
                The barbershop is one of those spaces. It holds memory, honesty, rhythm, style, and
                care. This brand extends that lived truth into a broader system of learning,
                products, gatherings, and reflective conversation.
              </p>
              <p>
                The aim is not to imitate therapy. The aim is to build a dignified restorative
                ecosystem that helps people begin, continue, and sustain the work of healing.
              </p>
            </div>
          </motion.div>

          <motion.div {...fade(0.08)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#704214', letterSpacing: '0.2em' }}>
              Founder Principles
            </p>
            <div className="space-y-3">
              {pillars.map((pillar) => (
                <p key={pillar} style={{ fontFamily: '"Libre Baskerville", serif', color: '#2C1810', lineHeight: 1.8 }}>
                  {pillar}
                </p>
              ))}
            </div>
          </motion.div>
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