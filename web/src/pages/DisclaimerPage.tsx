import { motion } from 'framer-motion';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

const sections = [
  {
    title: 'Nature of the Experience',
    body:
      'Cypher of Healing provides reflective wellness experiences, healing education, restorative products, and community-based gatherings. Content on this platform is intended for personal growth, self-reflection, and non-clinical support.',
  },
  {
    title: 'What We Do Not Provide',
    body:
      'We do not provide psychotherapy, clinical counseling, diagnosis, psychiatric care, medical treatment, or crisis intervention through this platform unless explicitly stated and delivered by appropriately licensed professionals.',
  },
  {
    title: 'Booking and Conversation Sessions',
    body:
      'Barber-chair sessions may include restorative conversation and wellness-oriented reflection. They are not therapy sessions and should not be understood as a substitute for licensed mental health care.',
  },
  {
    title: 'Courses, Workshops, and Events',
    body:
      'The Academy, webinars, workshops, and gatherings are educational and community-based experiences. They are not group therapy or clinical treatment.',
  },
  {
    title: 'Urgent Support',
    body:
      'If you are in crisis, experiencing thoughts of self-harm, or need urgent mental health support, contact 988, local emergency services, or a licensed provider immediately.',
  },
];

export default function DisclaimerPage() {
  return (
    <div style={{ backgroundColor: '#F5ECD7', minHeight: '100vh' }}>
      <section className="py-20 md:py-28" style={{ backgroundColor: '#2C1810' }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.p
            {...fade(0)}
            className="uppercase tracking-widest text-xs mb-5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#C9A84C', letterSpacing: '0.25em' }}
          >
            Participation Guide
          </motion.p>
          <motion.h1
            {...fade(0.08)}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7' }}
          >
            Clear boundaries build trust.
          </motion.h1>
          <motion.p
            {...fade(0.16)}
            className="text-lg max-w-3xl leading-relaxed"
            style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE' }}
          >
            We want every visitor to understand what Cypher of Healing offers, what it does not
            offer, and how to use the platform responsibly.
          </motion.p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-5">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              {...fade(index * 0.05)}
              className="p-6 md:p-8"
              style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}
            >
              <h2 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', fontSize: '1.6rem' }}>
                {section.title}
              </h2>
              <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#3D2B1F', lineHeight: 1.85 }}>
                {section.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}