import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const stations = [
  {
    number: '01',
    title: 'The Cipher Framework',
    icon: '◯',
    description:
      'You set your intention. Before the blade touches skin, there is a consultation. What are you carrying? What are you ready to release? You learn what the cipher means — as code, as zero, as circle — and make a commitment to honesty.',
    tools: ['Intention-Setting Exercise', 'Cipher Commitment Declaration'],
    color: 'from-primary-500 to-primary-600',
  },
  {
    number: '02',
    title: 'Roots of the Past',
    icon: '🌱',
    description:
      'You go back — not to suffer the past again, but to map it. Childhood wounds and family roles. Attachment styles. The patterns that were handed to you before you were old enough to refuse them. Archaeological work: careful, patient, precise.',
    tools: ['Family System Map', 'Childhood Wounds Inventory', 'Attachment Style Assessment'],
    color: 'from-dark-700 to-dark-800',
  },
  {
    number: '03',
    title: 'Breaking the Code',
    icon: '🔍',
    description:
      'Awareness enters the present tense. You learn to recognize your trauma responses in daily life — the triggers that send you spiraling, the moments when you react instead of choose. Before you can heal, you must see clearly what is wounded.',
    tools: ['Trigger Tracker', 'Awareness Journal', 'Trauma Response Map'],
    color: 'from-primary-600 to-primary-700',
  },
  {
    number: '04',
    title: 'Healing in Motion',
    icon: '🙌',
    description:
      'Now the restoration begins. Mind-body reset techniques. Cognitive reframing. The rewriting of beliefs that were never yours to begin with. You learn that healing is not a single event but a practice — a daily act, a discipline of tenderness toward yourself.',
    tools: ['Mind-Body Reset Protocol', 'Belief Rewriting Framework', 'Daily Healing Practice'],
    color: 'from-dark-800 to-dark-900',
  },
  {
    number: '05',
    title: 'Rebuilding Resilience',
    icon: '🏗️',
    description:
      'The fresh cut needs maintenance. Resilience is not something you achieve; it is something you cultivate. Daily habits: gratitude, boundaries, affirmations. The Boundaries Builder — the framework for protecting the person you are becoming.',
    tools: ['30-Day Resilience Tracker', 'Boundaries Builder', 'Daily Affirmation Practice'],
    color: 'from-primary-500 to-primary-700',
  },
  {
    number: '06',
    title: 'The Cipher of the Future',
    icon: '✦',
    description:
      'You visualize the healed self. Not as fantasy but as destination. You write a Legacy Letter — a document addressed to the next generation, declaring what you have chosen to pass down and what you have chosen to end.',
    tools: ['Healed Self Visualization', 'Legacy Letter', 'Cipher Statement Declaration'],
    color: 'from-dark-700 to-primary-600',
  },
];

export default function AcademyPage() {
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 uppercase tracking-widest">
            The Academy
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-dark-900">
            The Cipher of Healing
          </h1>
          <p className="text-2xl text-dark-600 font-light mb-2">
            Transforming Trauma into Resilience
          </p>
          <p className="text-dark-600 max-w-2xl">
            A 6-station guided journey that decodes the patterns of your past, inhabits the zero of
            the present, and restores the future you were always meant to live. Self-paced. 12–18
            hours of content. Built for real life.
          </p>
        </motion.div>

        {/* Course meta bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-6 mb-14 text-sm text-dark-600 border-b border-primary-100 pb-8"
        >
          <span>📍 6 Stations</span>
          <span>⏱ 12–18 hours</span>
          <span>📅 Self-paced, 6–8 weeks recommended</span>
          <span>🎓 Certificate of Completion</span>
          <div className="ml-auto">
            <Link to="/academy/cipher-of-healing" className="btn btn-primary px-8 py-3 text-lg">
              Enroll — $197
            </Link>
          </div>
        </motion.div>

        {/* Manifesto Pull Quote */}
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-l-4 border-primary-500 pl-8 py-2 mb-16 max-w-3xl"
        >
          <p className="text-2xl font-serif italic text-dark-800 leading-relaxed mb-3">
            "A cipher is a code. A system of hidden knowledge that must be decoded to be understood.
            This course gives you both: the code to understand what happened, and the key to unlock
            the future you were meant to live."
          </p>
          <cite className="text-primary-600 font-semibold not-italic">— The Cipher of Healing</cite>
        </motion.blockquote>

        {/* Six Stations */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-dark-900 mb-2">
            The Six Stations of Restoration
          </h2>
          <p className="text-dark-600 mb-10">
            We call them stations rather than modules — because a station is a place you arrive at,
            rest in, and depart from transformed.
          </p>
        </div>

        <div className="space-y-4 mb-20">
          {stations.map((station, idx) => (
            <motion.div
              key={station.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              viewport={{ once: true }}
              className="border-2 border-primary-100 rounded-2xl overflow-hidden hover:border-primary-300 transition-colors"
            >
              <button
                className="w-full text-left"
                onClick={() =>
                  setExpandedStation(expandedStation === station.number ? null : station.number)
                }
              >
                <div className="flex items-center gap-6 p-6">
                  <div
                    className={`bg-gradient-to-br ${station.color} text-white rounded-xl w-14 h-14 flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0`}
                  >
                    {station.number}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-serif font-bold text-dark-900">
                      {station.title}
                    </div>
                    {expandedStation !== station.number && (
                      <p className="text-dark-500 text-sm mt-1 line-clamp-1">
                        {station.description}
                      </p>
                    )}
                  </div>
                  <div className="text-2xl text-primary-400 flex-shrink-0">
                    {expandedStation === station.number ? '−' : '+'}
                  </div>
                </div>
              </button>

              {expandedStation === station.number && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="px-8 pb-8 border-t border-primary-100"
                >
                  <p className="text-dark-700 leading-relaxed mt-6 mb-6 text-lg">
                    {station.description}
                  </p>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary-600 font-bold mb-3">
                      Tools & Exercises
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {station.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Four Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-dark-900 text-white rounded-3xl p-12 mb-20"
        >
          <h2 className="text-3xl font-serif font-bold mb-2 text-center">The Four Pillars</h2>
          <p className="text-center text-dark-300 mb-10">The philosophy beneath every station</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { pillar: 'Awareness', desc: 'You cannot heal what you cannot see' },
              { pillar: 'Understanding', desc: 'Healing requires context, not just compassion' },
              { pillar: 'Practice', desc: 'Transformation is built in small, daily repetitions' },
              { pillar: 'Legacy', desc: 'Your healing is not just for you — it echoes forward' },
            ].map((p) => (
              <div key={p.pillar} className="text-center">
                <div className="text-primary-400 text-4xl mb-3">◆</div>
                <div className="text-xl font-serif font-bold mb-2">{p.pillar}</div>
                <div className="text-dark-300 text-sm">{p.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4"
        >
          {[
            { stat: '6 Stations', label: 'of deliberate, sequenced restoration' },
            { stat: '12–18 hrs', label: 'of content, tools, and practice' },
            { stat: '1 Promise', label: 'to decode your past & claim your future' },
          ].map((item, idx) => (
            <div key={idx} className="text-center p-8 border-2 border-primary-100 rounded-2xl">
              <div className="text-4xl font-serif font-bold text-primary-500 mb-2">
                {item.stat}
              </div>
              <div className="text-dark-600">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 mb-4 py-16 bg-gradient-to-br from-primary-50 to-white rounded-3xl border-2 border-primary-100"
        >
          <p className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-4">
            The cipher is open
          </p>
          <h3 className="text-4xl font-serif font-bold text-dark-900 mb-4">Step In.</h3>
          <p className="text-dark-600 max-w-xl mx-auto mb-8">
            Once you are in the cipher, you are held. And what is held can heal.
          </p>
          <Link to="/academy/cipher-of-healing" className="btn btn-primary px-12 py-4 text-lg">
            Enroll Now — $197
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
