import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { homeTestimonials, pathwayRecommendations } from '@/content/siteContent';

// ——— Reusable pieces ———

const GoldRule = () => (
  <div className="gold-rule my-10 text-lg tracking-[0.4em]">◆</div>
);

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
});

// ——— Movement 1: The Threshold ———
function Threshold() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#2C1810' }}
    >
      {/* Background image - contemplative man's portrait */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/hero/hero-main.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundAttachment: 'fixed',
          opacity: 0.25,
        }}
      />
      
      {/* Sepia vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(44,24,16,0.2) 0%, rgba(44,24,16,0.85) 100%)',
        }}
      />

      {/* Aaron Douglas concentric circles — decorative bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, transparent 18%, rgba(201,168,76,0.06) 18%, rgba(201,168,76,0.06) 18.5%, transparent 18.5%), radial-gradient(circle at 50% 50%, transparent 32%, rgba(201,168,76,0.04) 32%, rgba(201,168,76,0.04) 32.5%, transparent 32.5%), radial-gradient(circle at 50% 50%, transparent 48%, rgba(201,168,76,0.025) 48%, rgba(201,168,76,0.025) 48.5%, transparent 48.5%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 sm:px-10">
        <motion.div {...fade(0)}>
          <p
            className="uppercase tracking-[0.25em] mb-8"
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '11px',
              color: '#C9A84C',
            }}
          >
            CypherOfHealing · Est. 2026
          </p>
        </motion.div>

        <motion.h1
          {...fade(0.1)}
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            color: '#F5ECD7',
            fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          The chair. The course.<br />
          <em style={{ color: '#C9A84C' }}>The circle.</em>
        </motion.h1>

        <motion.p
          {...fade(0.22)}
          style={{
            fontFamily: '"Libre Baskerville", Georgia, serif',
            color: '#E8DCBE',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            lineHeight: 1.75,
            maxWidth: '760px',
            margin: '1.75rem auto 0',
          }}
        >
          CypherOfHealing is a barber-led restoration brand built around reflective care,
          healing education, and community. Start with the chair, enter the Academy, or step
          into the circle. This platform is restorative and educational, not therapy.
        </motion.p>

        <motion.div {...fade(0.34)} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/booking" className="btn btn-primary" style={{ fontSize: '13px' }}>
            Start with the Chair
          </Link>
          <Link
            to="/about"
            className="btn"
            style={{
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.5)',
              color: '#E8DCBE',
              fontSize: '13px',
            }}
          >
            Read the Doctrine
          </Link>
        </motion.div>

        <motion.p
          {...fade(0.42)}
          className="mt-6"
          style={{
            fontFamily: '"DM Sans", sans-serif',
            color: '#C9A84C',
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Reflective wellness experiences. Healing education. Not crisis care.
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          {...fade(0.5)}
          className="mt-20 flex flex-col items-center gap-2"
          style={{ color: '#4A2C0E' }}
        >
          <div
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            scroll
          </div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Orientation() {
  const cards = [
    {
      title: 'What this is',
      body: 'A barber-led restoration platform for reflective care, healing education, and community-based growth.',
    },
    {
      title: 'Who it helps',
      body: 'People carrying inherited patterns, unresolved wounds, or a desire for deeper dignity, structure, and self-understanding.',
    },
    {
      title: 'What it is not',
      body: 'CypherOfHealing does not present itself as therapy, diagnosis, or crisis support through this platform.',
    },
  ];

  return (
    <section style={{ backgroundColor: '#F5ECD7' }} className="py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div {...fade()} className="max-w-3xl mb-10">
          <p className="uppercase tracking-[0.2em] mb-4" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}>
            Orientation
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1810', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            Understand the work before you enter it.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, index) => (
            <motion.div key={card.title} {...fade(index * 0.06)} className="p-6" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
              <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1810', fontSize: '1.3rem' }}>
                {card.title}
              </h3>
              <p style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: '#3D2B1F', fontSize: '15px', lineHeight: 1.8 }}>
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PathwaySelector() {
  const options = [
    {
      key: 'chair',
      prompt: 'I need a trusted human place to begin.',
    },
    {
      key: 'academy',
      prompt: 'I need structure and language for what I am carrying.',
    },
    {
      key: 'vault',
      prompt: 'I want books, prompts, and daily tools first.',
    },
    {
      key: 'show',
      prompt: 'I want to feel the worldview before I commit.',
    },
    {
      key: 'circle',
      prompt: 'I want live learning and community accountability.',
    },
  ] as const;

  const [selected, setSelected] = useState<(typeof options)[number]['key']>(options[0].key);

  return (
    <section style={{ backgroundColor: '#E8DCBE' }} className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <motion.div {...fade()}>
          <p className="uppercase tracking-[0.2em] mb-4" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}>
            Guided Intake
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1810', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            If you are not sure where to begin, start here.
          </h2>
          <p className="mt-5" style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: '#704214', fontSize: '16px', lineHeight: 1.85 }}>
            Choose the statement that feels most true right now. The goal is not to diagnose you. It is to route you into the right doorway.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3">
            {options.map((option, index) => {
              const recommendation = pathwayRecommendations[option.key];
              const isSelected = option.key === selected;

              return (
                <motion.div key={option.key} {...fade(index * 0.05)}>
                  <button
                    type="button"
                    onClick={() => setSelected(option.key)}
                    className="block p-5 w-full text-left"
                    style={{
                      backgroundColor: isSelected ? '#2C1810' : '#F5ECD7',
                      border: isSelected ? '2px solid #C9A84C' : '1px solid #8B5E3C',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: isSelected ? '#F5ECD7' : '#2C1810', lineHeight: 1.8 }}>
                      {option.prompt}
                    </p>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...fade(0.1)} className="p-6" style={{ backgroundColor: '#2C1810', borderLeft: '4px solid #C9A84C' }}>
          <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: '"DM Sans", sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
            Recommended Starting Point
          </p>
          <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", serif', color: '#F5ECD7', fontSize: '1.8rem' }}>
            {pathwayRecommendations[selected].title}
          </h3>
          <p style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.85 }}>
            {pathwayRecommendations[selected].description}
          </p>
          <div className="mt-6">
            <Link to={pathwayRecommendations[selected].path} className="btn btn-primary" style={{ fontSize: '13px' }}>
              {pathwayRecommendations[selected].cta}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ——— Movement 2: The Lineage ———
function Lineage() {
  const streams = [
    {
      label: 'The Chair',
      path: '/booking',
      desc: 'Precision work attended to with care — and a conversation that goes wherever it needs to go.',
      num: 'I',
    },
    {
      label: 'The Vault',
      path: '/store',
      desc: 'Restoration oils, books, journals. Extensions of the healing, not retail products.',
      num: 'II',
    },
    {
      label: 'The Academy',
      path: '/academy',
      desc: 'The Cipher of Healing — six stations, one journey, the code of your life decoded.',
      num: 'III',
    },
    {
      label: 'The Stage',
      path: '/events',
      desc: 'The Open Cipher — live webinars and workshops. The circle, open.',
      num: 'IV',
    },
    {
      label: 'The Inner Circle',
      path: '/events',
      desc: 'Quarterly gatherings and the retreat at The Factory. The cipher, sustained.',
      num: 'V',
    },
  ];

  return (
    <section style={{ backgroundColor: '#F5ECD7' }} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        <motion.div {...fade()} className="max-w-2xl mb-16">
          <p
            className="uppercase tracking-[0.2em] mb-5"
            style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}
          >
            The Lineage
          </p>
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              color: '#2C1810',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              lineHeight: 1.2,
            }}
          >
            Before the barber was a barber,<br />
            <em>he was a healer.</em>
          </h2>
          <p
            className="mt-5"
            style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              color: '#704214',
              fontSize: '16px',
              lineHeight: 1.85,
            }}
          >
            For centuries, the man with steady hands and a blade was the most accessible healer
            the common person would ever know. The barbershop carried that lineage through slavery,
            through Jim Crow, through the civil rights movement. CypherOfHealing honors that
            tradition. We decode what needs healing, restore what dignity can hold, and translate
            that lineage into a modern experience of care, education, and accountability.
          </p>
        </motion.div>

        <GoldRule />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-12">
          {streams.map((s, i) => (
            <motion.div key={s.label} {...fade(i * 0.08)}>
              <Link to={s.path} className="block h-full group">
                <div
                  className="h-full p-6 transition-all duration-300"
                  style={{
                    backgroundColor: '#E8DCBE',
                    color: '#3D2B1F',
                    border: '1px solid #8B5E3C',
                    borderRadius: '3px',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = '#2C1810';
                    el.style.borderColor = '#C9A84C';
                    el.style.color = '#F5ECD7';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = '#E8DCBE';
                    el.style.borderColor = '#8B5E3C';
                    el.style.color = '#3D2B1F';
                  }}
                >
                  <div
                    className="mb-3"
                    style={{
                      fontFamily: '"IBM Plex Mono", Menlo, monospace',
                      fontSize: '11px',
                      color: '#C9A84C',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {s.num}
                  </div>
                  <h3
                    className="mb-2 transition-colors"
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'inherit',
                    }}
                  >
                    {s.label}
                  </h3>
                  <p
                    style={{
                      fontFamily: '"Libre Baskerville", Georgia, serif',
                      fontSize: '12px',
                      lineHeight: 1.7,
                      color: 'inherit',
                      opacity: 0.8,
                    }}
                  >
                    {s.desc}
                  </p>
                  <div
                    className="mt-4"
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      color: '#C9A84C',
                      textTransform: 'uppercase',
                    }}
                  >
                    Explore →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— Movement 3: The Craft ———
function TheCraft() {
  const shots = [
    {
      label: 'The Consultation',
      sub: 'Before the blade — the conversation',
      photo: '/images/craft/consultation.jpg',
    },
    {
      label: 'The Fade',
      sub: 'Precision is care made visible',
      photo: '/images/craft/fade.jpg',
    },
    {
      label: 'The Line-Up',
      sub: 'Edges sharp enough to declare intention',
      photo: '/images/craft/lineup.jpg',
    },
    {
      label: 'The Restoration',
      sub: 'Oil, blade, and steady hands',
      photo: '/images/craft/restoration.jpg',
    },
  ];

  return (
    <section style={{ backgroundColor: '#2C1810' }} className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div {...fade()} className="mb-12">
          <p
            className="uppercase tracking-[0.2em] mb-4"
            style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}
          >
            The Craft
          </p>
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              color: '#F5ECD7',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              lineHeight: 1.2,
            }}
          >
            Every session is a restoration.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shots.map((s, i) => (
            <motion.div key={s.label} {...fade(i * 0.1)}>
              <div
                className="relative overflow-hidden"
                style={{ aspectRatio: '3/4', borderRadius: '3px' }}
              >
                <img
                  src={s.photo}
                  alt={s.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'sepia(0.5) contrast(1.15) brightness(0.72) saturate(0.6)' }}
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(26,14,9,0.88) 0%, rgba(26,14,9,0.25) 55%, transparent 100%)',
                    border: '1px solid rgba(201,168,76,0.15)',
                  }}
                >
                  {/* Vintage grain overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                    }}
                  />
                  {/* Vignette */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, transparent 40%, rgba(26,14,9,0.7) 100%)',
                    }}
                  />
                  <div className="relative z-10">
                    <div
                      style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        color: '#F5ECD7',
                        fontSize: '13px',
                        fontWeight: 700,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontFamily: '"Libre Baskerville", Georgia, serif',
                        fontStyle: 'italic',
                        color: '#8B5E3C',
                        fontSize: '11px',
                        marginTop: '3px',
                      }}
                    >
                      {s.sub}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fade(0.3)} className="mt-12 text-center">
          <Link
            to="/booking"
            className="btn"
            style={{
              border: '1px solid rgba(201,168,76,0.5)',
              color: '#C9A84C',
              background: 'transparent',
              fontSize: '13px',
            }}
          >
            Book Your Session
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ——— Movement 4: The Knowledge ———
function TheKnowledge() {
  const stations = [
    ['01', 'The Cipher Framework'],
    ['02', 'Roots of the Past'],
    ['03', 'Breaking the Code'],
    ['04', 'Healing in Motion'],
    ['05', 'Rebuilding Resilience'],
    ['06', 'The Cipher of the Future'],
  ];

  return (
    <section style={{ backgroundColor: '#E8DCBE' }} className="py-24 md:py-32 relative overflow-hidden">
      {/* Aaron Douglas pattern */}
      <div className="absolute inset-0 pattern-circles pointer-events-none" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: course info */}
          <motion.div {...fade()}>
            <p
              className="uppercase tracking-[0.2em] mb-5"
              style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}
            >
              The Academy
            </p>
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#2C1810',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                lineHeight: 1.2,
              }}
            >
              The Cipher of Healing:<br />
              <em>Transforming Trauma into Resilience</em>
            </h2>

            <p
              className="mt-5"
              style={{
                fontFamily: '"Libre Baskerville", Georgia, serif',
                color: '#704214',
                fontSize: '16px',
                lineHeight: 1.85,
              }}
            >
              Six stations. One journey. The code of your life, decoded. A self-paced, 12–18 hour
              structured methodology for interrupting inherited patterns and becoming the first
              fully healed version of your lineage.
            </p>

            <div className="mt-8">
              <Link to="/academy" className="btn btn-primary" style={{ fontSize: '13px' }}>
                Enter the Academy
              </Link>
            </div>
          </motion.div>

          {/* Right: station list */}
          <motion.div {...fade(0.15)}>
            <div className="space-y-0">
              {stations.map(([num, title], i) => (
                <motion.div
                  key={num}
                  {...fade(i * 0.06)}
                  className="flex items-center gap-5 py-4"
                  style={{ borderBottom: '1px solid rgba(112,66,20,0.2)' }}
                >
                  <span
                    style={{
                      fontFamily: '"IBM Plex Mono", Menlo, monospace',
                      fontSize: '12px',
                      color: '#C9A84C',
                      letterSpacing: '0.08em',
                      flexShrink: 0,
                      width: '2rem',
                    }}
                  >
                    {num}
                  </span>
                  <span
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      color: '#2C1810',
                      fontSize: '16px',
                    }}
                  >
                    {title}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Pathways() {
  const steps = [
    {
      step: '01',
      title: 'Start with the Chair',
      body: 'Enter through ritual, grooming, and reflective conversation if you want an in-person point of trust.',
      to: '/booking',
    },
    {
      step: '02',
      title: 'Enter the Academy',
      body: 'Choose the structured path if you want language, tools, and a framework for decoding patterns.',
      to: '/academy',
    },
    {
      step: '03',
      title: 'Carry the Work Home',
      body: 'Use oils, books, and journals as tangible reminders that restoration continues outside the session.',
      to: '/store',
    },
    {
      step: '04',
      title: 'Watch the Show',
      body: 'Use the barber-chair conversation format as a low-friction way to understand the voice, worldview, and emotional texture of the brand.',
      to: '/show',
    },
    {
      step: '05',
      title: 'Step into the Circle',
      body: 'Join workshops and gatherings when you want communal reflection, live teaching, and accountability.',
      to: '/events',
    },
  ];

  return (
    <section style={{ backgroundColor: '#F5ECD7' }} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">
        <motion.div {...fade()} className="max-w-3xl mb-12">
          <p className="uppercase tracking-[0.2em] mb-4" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}>
            How to Enter
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1810', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            One identity. Clear entry points.
          </h2>
          <p className="mt-5" style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: '#704214', fontSize: '16px', lineHeight: 1.85 }}>
            The experience should feel guided, not mysterious. Choose the pathway that matches your current need.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((item, index) => (
            <motion.div key={item.title} {...fade(index * 0.06)}>
              <Link to={item.to} className="block p-6 h-full" style={{ backgroundColor: '#E8DCBE', border: '1px solid #8B5E3C' }}>
                <div className="mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#C9A84C', fontSize: '12px' }}>
                  {item.step}
                </div>
                <h3 className="mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2C1810', fontSize: '1.35rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: '#3D2B1F', lineHeight: 1.8 }}>
                  {item.body}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheShowBridge() {
  return (
    <section style={{ backgroundColor: '#2C1810' }} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div {...fade()}>
          <p className="uppercase tracking-[0.2em] mb-4" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}>
            The Show
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#F5ECD7', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            The worldview, made visible.
          </h2>
          <p className="mt-5" style={{ fontFamily: '"Libre Baskerville", Georgia, serif', color: '#E8DCBE', fontSize: '16px', lineHeight: 1.85 }}>
            The barber-chair conversation format is the public editorial front door to Cypher of
            Healing. It lets visitors encounter the voice, ritual, and emotional honesty of the
            brand before they ever choose a deeper pathway.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/show" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Explore the Show
            </Link>
            <Link to="/events" className="btn btn-outline" style={{ fontSize: '13px', borderColor: '#C9A84C', color: '#C9A84C' }}>
              Join a Live Cipher
            </Link>
          </div>
        </motion.div>

        <motion.div {...fade(0.12)} className="p-8" style={{ backgroundColor: '#3D2B1F', borderLeft: '4px solid #C9A84C' }}>
          <p className="uppercase tracking-widest text-xs mb-4" style={{ fontFamily: '"DM Sans", sans-serif', color: '#C9A84C', letterSpacing: '0.2em' }}>
            Format Logic
          </p>
          <div className="space-y-3">
            {[
              'A service begins with a real theme.',
              'The conversation remains grounded in dignity, not spectacle.',
              'Each episode offers a clear Cipher takeaway.',
              'The viewer leaves with a next step into the wider ecosystem.',
            ].map((item) => (
              <p key={item} style={{ fontFamily: '"Libre Baskerville", serif', color: '#E8DCBE', lineHeight: 1.8 }}>
                {item}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ——— Movement 5: The Cipher (testimonials + CTA) ———
function TheCipherClose() {
  return (
    <section style={{ backgroundColor: '#2C1810' }} className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        {/* Testimonials */}
        <motion.p
          {...fade()}
          className="uppercase tracking-[0.2em] mb-12 text-center"
          style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#C9A84C' }}
        >
          From the Cipher
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {homeTestimonials.map((t, i) => (
            <motion.div key={t.name} {...fade(i * 0.1)}>
              <div
                className="p-8 h-full"
                style={{
                  backgroundColor: '#3D2B1F',
                  borderLeft: '3px solid #C9A84C',
                  borderRadius: '3px',
                }}
              >
                <p
                  className="italic mb-6"
                  style={{
                    fontFamily: '"Libre Baskerville", Georgia, serif',
                    color: '#E8DCBE',
                    fontSize: '15px',
                    lineHeight: 1.8,
                  }}
                >
                  "{t.quote}"
                </p>
                <div>
                  <div
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      color: '#F5ECD7',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      color: '#8B5E3C',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginTop: '2px',
                    }}
                  >
                    {t.via}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <GoldRule />

        {/* Manifesto close */}
        <motion.div {...fade(0.1)} className="text-center mt-10">
          <h2
            className="mb-3"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              color: '#C9A84C',
              fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
              lineHeight: 1.2,
            }}
          >
            The cipher is open.
          </h2>
          <p
            className="mb-10 italic"
            style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              color: '#E8DCBE',
              fontSize: '18px',
            }}
          >
            Step in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn btn-primary" style={{ fontSize: '13px' }}>
              Begin Your Session
            </Link>
            <Link
              to="/academy"
              className="btn"
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#E8DCBE',
                fontSize: '13px',
              }}
            >
              Enter the Academy
            </Link>
            <Link
              to="/store"
              className="btn"
              style={{
                background: 'transparent',
                border: '1px solid rgba(201,168,76,0.4)',
                color: '#E8DCBE',
                fontSize: '13px',
              }}
            >
              Explore the Vault
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ——— Page ———

// ——— Page ———
export default function HomePage() {
  return (
    <div>
      <Threshold />
      <Orientation />
      <PathwaySelector />
      <Lineage />
      <TheCraft />
      <TheKnowledge />
      <Pathways />
      <TheShowBridge />
      <TheCipherClose />
    </div>
  );
}
