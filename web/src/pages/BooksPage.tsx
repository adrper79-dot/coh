import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const books = [
  {
    title: 'The Cipher of Healing',
    role: 'Core framework text',
    desc: 'The primary written expression of the doctrine for readers who want the worldview, language, and architecture of the work in book form.',
  },
  {
    title: 'The Companion Journal',
    role: 'Reflective practice tool',
    desc: 'A guided writing companion for turning insight into repeatable reflection, tracking, and daily restoration practice.',
  },
  {
    title: 'Children and Legacy Titles',
    role: 'Lineage extension',
    desc: 'Books that widen the work into family, inheritance, and the question of what the next generation receives from our healing.',
  },
];

export default function BooksPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            {...fade(0)}
            className="uppercase tracking-widest text-xs mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
          >
            Books
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
          >
            The written doorway into the work.
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="text-lg max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
          >
            Books are not side products here. They are one of the clearest ways to carry the
            doctrine home, revisit it slowly, and let the work deepen in private.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {books.map((book, index) => (
            <motion.div key={book.title} {...fade(index * 0.06)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
              <p className="uppercase tracking-widest text-xs mb-3" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.14em' }}>
                {book.role}
              </p>
              <h2 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.45rem' }}>
                {book.title}
              </h2>
              <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                {book.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-20" style={{ backgroundColor: '#E8DCBE' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fade()}>
            <h2 className="mb-4" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '2rem' }}>
              Why books matter in this ecosystem
            </h2>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
              A book lets someone enter the worldview privately, revisit it repeatedly, and reflect
              without needing to begin with a public or live experience. That makes books a trust
              surface, not just a commerce surface.
            </p>
          </motion.div>

          <motion.div {...fade(0.08)} className="p-6" style={{ backgroundColor: '#2C1810', borderLeft: '4px solid #C9A84C' }}>
            <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
              Channel Strategy
            </p>
            <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.85 }}>
              Keep books discoverable on major marketplaces while also presenting them on the owned
              platform as part of a larger restoration journey with bundles, journals, and guided
              next steps.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fade()} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/store" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Explore the Vault
            </Link>
            <Link to="/academy" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Enter the Academy
            </Link>
            <Link to="/show" className="btn btn-outline" style={{ fontSize: '13px' }}>
              Watch the Show
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}