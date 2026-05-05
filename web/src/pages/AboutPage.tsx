import { motion } from 'framer-motion';
import { TrackedLink as Link } from '@/components/TrackedLink';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const principles = [
  'The barbershop can be a place of reflection, dignity, and restoration.',
  'Healing work often begins with language, ritual, and honest self-observation.',
  'The chair, the course, the products, and the gatherings are one system expressed at different depths.',
  'The outer is a reflection of the inner.',
];

const pathways = [
  {
    title: 'The Chair',
    desc: 'A barber session and reflective care entry point for people who want ritual, conversation, and presence.',
    to: '/booking',
  },
  {
    title: 'The Academy',
    desc: 'A structured educational framework for decoding inherited patterns and practicing restoration over time.',
    to: '/academy',
  },
  {
    title: 'The Vault',
    desc: 'Books, oils, journals, and tactile tools that carry the work beyond the appointment.',
    to: '/store',
  },
  {
    title: 'The Stage',
    desc: 'Workshops and gatherings where the cipher becomes communal, conversational, and accountable.',
    to: '/events',
  },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade(0)}
            className="uppercase tracking-widest text-xs mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
          >
            The Doctrine
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
          >
            One restoration system.<br />
            Multiple ways to enter.
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="text-lg max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
          >
            Cypher of Healing is a barber-led restoration brand built around reflective care,
            healing education, and community. It is designed to help people decode inherited
            patterns, practice dignity, and carry restoration into daily life.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div {...fade()}>
            <h2
              style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2rem' }}
              className="mb-5"
            >
              What this work is
            </h2>
            <div className="space-y-4">
              {principles.map((item) => (
                <div
                  key={item}
                  className="p-5"
                  style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}
                >
                  <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(0.1)}>
            <h2
              style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2rem' }}
              className="mb-5"
            >
              What this work is not
            </h2>
            <div
              className="p-6"
              style={{ backgroundColor: '#2C1810', borderLeft: '4px solid #C9A84C' }}
            >
              <p className="mb-4" style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.8 }}>
                Cypher of Healing does not present itself as therapy, diagnosis, medical treatment,
                or crisis support through this platform.
              </p>
              <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.8 }}>
                Our work is reflective, educational, and restorative. If you need clinical mental
                health care or urgent support, use a licensed provider or emergency resource.
              </p>
              <div className="mt-6">
                <Link to="/disclaimer" className="btn btn-outline" style={{ fontSize: '12px', borderColor: '#C9A84C', color: '#C9A84C' }}>
                  Read the Participation Guide
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: '#E8DCBE' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fade()} className="mb-10 max-w-3xl">
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
              Pathways
            </p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2.4rem' }} className="mb-4">
              The same identity, expressed in different forms.
            </h2>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#704214', lineHeight: 1.85 }}>
              Choose the entry point that matches your current need. Each pathway connects back to
              the same doctrine of reflective care and restoration.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pathways.map((item, index) => (
              <motion.div key={item.title} {...fade(index * 0.06)}>
                <Link to={item.to} className="block p-6 h-full" style={{ backgroundColor: '#F5ECD7', border: '1px solid #8B5E3C' }}>
                  <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.4rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                    {item.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade(0.2)} className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/founder" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Read the Founder Story
            </Link>
            <Link to="/books" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Explore the Books Pathway
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}