import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth';

interface Lesson {
  id: string;
  title: string;
  contentType: 'video' | 'text' | 'quiz';
  durationMinutes: number | null;
  isFree: boolean;
  sortOrder: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  dripDelayDays: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  price: string;
  totalModules: number;
  totalLessons: number;
  estimatedHours: string | null;
  isPublished: boolean;
  modules: Module[];
  enrolled?: boolean;
}

const API = import.meta.env.VITE_API_URL ?? 'https://cypher-of-healing-api.workers.dev';

const pricingTiers = [
  {
    name: 'The Cipher',
    price: '$197',
    description: 'Full course access, self-paced for life',
    features: [
      'All 6 stations of content',
      'Downloadable workbooks & exercises',
      'Lifetime access',
      'Certificate of completion',
    ],
    cta: 'Enroll Now',
    highlighted: false,
  },
  {
    name: 'The Cipher + Coaching',
    price: '$297',
    description: 'Course + 1 private integration session',
    features: [
      'Everything in The Cipher',
      '1 private coaching session (60 min)',
      'Personalized integration plan',
      'Priority email support',
      'Access to community forums',
    ],
    cta: 'Enroll + Book Session',
    highlighted: true,
  },
  {
    name: 'The Full Immersion',
    price: '$497',
    description: 'Deep-dive with ongoing support',
    features: [
      'Everything in Cipher + Coaching',
      '3 private coaching sessions',
      'Weekly group accountability call',
      'Custom resilience blueprint',
      'Inner Circle community access',
    ],
    cta: 'Apply for Immersion',
    highlighted: false,
  },
];

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!slug) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API}/api/academy/courses/${slug}`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCourse(data.course);
      // Expand first module by default
      if (data.course.modules?.length > 0) {
        setExpandedModule(data.course.modules[0].id);
      }
    } catch {
      // Course not found or API error — show fallback content
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async (tier: typeof pricingTiers[0]) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (tier.name === 'The Full Immersion') {
      navigate('/booking');
      return;
    }
    if (!course) return;
    setEnrolling(true);
    try {
      const res = await fetch(`${API}/api/academy/courses/${course.slug}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.checkoutUrl && data.checkoutUrl !== 'TODO_STRIPE_CHECKOUT_URL') {
        window.location.href = data.checkoutUrl;
      } else {
        // Enrolled (dev/free) — go to first lesson
        const firstLesson = course.modules?.[0]?.lessons?.[0];
        if (firstLesson) {
          navigate(`/academy/${course.slug}/${firstLesson.id}`);
        } else {
          navigate('/academy');
        }
      }
    } catch {
      // Enrollment error
    } finally {
      setEnrolling(false);
    }
  };

  const totalMinutes =
    course?.modules
      .flatMap((m) => m.lessons)
      .reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0) ?? 0;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use fallback data if API unavailable (static course data)
  const displayTitle = course?.title ?? 'The Cipher of Healing';
  const displayDescription =
    course?.description ??
    'A 6-station guided journey that decodes the language of your wounds, inhabits the zero of the present, and restores the future you were always meant to live.';
  const displayModules = course?.modules ?? [];
  const displayPrice = course?.price ? `$${course.price}` : '$197';
  const totalLessons = course?.totalLessons ?? displayModules.flatMap((m) => m.lessons).length;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-dark-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1 bg-primary-900 text-primary-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                The Academy — Signature Course
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
                {displayTitle}
              </h1>
              <p className="text-xl text-dark-300 leading-relaxed mb-8">
                {displayDescription}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap gap-6 text-sm text-dark-400 mb-10">
                <span className="flex items-center gap-2">
                  <span className="text-primary-500">◈</span>
                  {course?.totalModules ?? 6} Stations
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-primary-500">◈</span>
                  {totalLessons} Lessons
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-primary-500">◈</span>
                  {totalMinutes > 0
                    ? `${Math.round(totalMinutes / 60)}+ hrs`
                    : '12–18 hrs'}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-primary-500">◈</span>
                  Self-paced
                </span>
              </div>

              {course?.enrolled ? (
                <Link
                  to={`/academy/${course.slug}/${course.modules?.[0]?.lessons?.[0]?.id}`}
                  className="btn btn-primary px-10 py-4 text-lg inline-block"
                >
                  Continue Learning →
                </Link>
              ) : (
                <a
                  href="#pricing"
                  className="btn btn-primary px-10 py-4 text-lg inline-block"
                >
                  Enroll — Starting at {displayPrice}
                </a>
              )}
            </motion.div>

            {/* Course card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-dark-800 rounded-3xl p-8 border border-dark-600"
            >
              <blockquote className="text-2xl font-serif italic text-dark-200 leading-relaxed mb-6">
                "A cipher is code. A zero. A circle. This course gives you both the key and the
                courage to use it."
              </blockquote>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Format', value: 'Video + Workbook' },
                  { label: 'Access', value: 'Lifetime' },
                  { label: 'Level', value: 'All levels' },
                  { label: 'Certificate', value: 'Yes, upon completion' },
                ].map((item) => (
                  <div key={item.label} className="bg-dark-700 rounded-xl p-4">
                    <div className="text-xs text-dark-400 uppercase tracking-wide mb-1">
                      {item.label}
                    </div>
                    <div className="text-white font-semibold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What you'll decode */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-serif font-bold text-dark-900 mb-4">
              What You Will Decode
            </h2>
            <p className="text-dark-600 max-w-2xl mx-auto text-lg">
              Six stations of deliberate, sequenced restoration — because healing is not random, it
              is structured.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                num: '01',
                title: 'The Cipher Framework',
                desc: 'Set your intention. Learn what the cipher means — as code, as zero, as circle. Make the commitment to honesty.',
                icon: '◯',
              },
              {
                num: '02',
                title: 'Roots of the Past',
                desc: 'Map your wounds without re-living them. Childhood patterns, family roles, attachment styles — the code you inherited.',
                icon: '🌱',
              },
              {
                num: '03',
                title: 'Breaking the Code',
                desc: 'Recognize trauma responses in daily life. Name the triggers. Close the gap between stimulus and choice.',
                icon: '🔍',
              },
              {
                num: '04',
                title: 'Healing in Motion',
                desc: 'Mind-body reset. Cognitive reframing. Rewriting beliefs that were never yours to begin with.',
                icon: '🙌',
              },
              {
                num: '05',
                title: 'Rebuilding Resilience',
                desc: 'Daily habits that compound. Boundaries as love. The 30-day tracker that keeps the fresh cut clean.',
                icon: '🏗️',
              },
              {
                num: '06',
                title: 'The Cipher of the Future',
                desc: 'Visualize the healed self. Write your Legacy Letter. Declare what you pass forward — and what ends with you.',
                icon: '✦',
              },
            ].map((s) => (
              <motion.div
                key={s.num}
                variants={itemVariants}
                className="border-2 border-primary-100 rounded-2xl p-8 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-primary-500 mb-1 tracking-widest">
                      STATION {s.num}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-dark-900">{s.title}</h3>
                  </div>
                </div>
                <p className="text-dark-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Course curriculum (live from API if available) */}
      {displayModules.length > 0 && (
        <section className="py-20 px-4 bg-dark-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-4xl font-serif font-bold text-dark-900 mb-4">
                Full Curriculum
              </h2>
              <p className="text-dark-600">
                {displayModules.length} stations · {totalLessons} lessons ·{' '}
                {totalMinutes > 0 ? `${Math.round(totalMinutes / 60)}+ hours` : '12–18 hours'} of
                content
              </p>
            </motion.div>

            <div className="space-y-3">
              {displayModules.map((mod, idx) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="border-2 border-primary-100 rounded-2xl overflow-hidden bg-white"
                >
                  <button
                    className="w-full text-left flex items-center gap-5 p-6"
                    onClick={() =>
                      setExpandedModule(expandedModule === mod.id ? null : mod.id)
                    }
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-serif font-bold text-dark-900">{mod.title}</div>
                      <div className="text-sm text-dark-500 mt-0.5">
                        {mod.lessons.length} lessons
                      </div>
                    </div>
                    <span className="text-primary-400 text-2xl flex-shrink-0">
                      {expandedModule === mod.id ? '−' : '+'}
                    </span>
                  </button>

                  {expandedModule === mod.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-primary-100"
                    >
                      {mod.description && (
                        <p className="px-8 py-4 text-dark-600">{mod.description}</p>
                      )}
                      {mod.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 px-8 py-3 border-t border-dark-50 text-sm"
                        >
                          <span className="text-dark-400 w-5 text-center flex-shrink-0">
                            {lesson.isFree ? '▶' : '🔒'}
                          </span>
                          <span className="flex-1 text-dark-700">{lesson.title}</span>
                          {lesson.isFree && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Free preview
                            </span>
                          )}
                          {lesson.durationMinutes && (
                            <span className="text-dark-400 text-xs">{lesson.durationMinutes}m</span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif font-bold text-dark-900 text-center mb-14"
          >
            From the Inner Circle
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                quote:
                  "I've done therapy, journaling, all of it. The Cipher was different. It didn't just ask me to feel — it asked me to decode. By Module 3, I could name what I was doing in real time. That changed everything.",
                name: 'Kezia M.',
                title: 'Enrolled: The Cipher',
              },
              {
                quote:
                  "The Legacy Letter I wrote in Station 6 is the most important thing I've ever put on paper. I never thought about healing as something I was doing for my children too. Now I can't think about it any other way.",
                name: 'David R.',
                title: 'Enrolled: The Cipher + Coaching',
              },
              {
                quote:
                  "Station 5 — the Resilience Stack — is now my morning. Every single day. I didn't think I was capable of daily practice, but this made it feel like self-respect, not discipline.",
                name: 'Amara J.',
                title: 'Enrolled: Full Immersion',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-dark-50 rounded-3xl p-8"
              >
                <p className="text-dark-700 italic leading-relaxed mb-6 text-lg">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-dark-900">{t.name}</div>
                  <div className="text-primary-600 text-sm">{t.title}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Enter the Cipher</h2>
            <p className="text-dark-300 text-lg max-w-xl mx-auto">
              Three tiers of access. One transformation. Choose the level of support that matches
              where you are.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                className={`rounded-3xl p-8 flex flex-col ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white ring-4 ring-primary-400 ring-offset-4 ring-offset-dark-900'
                    : 'bg-dark-800 text-white border border-dark-600'
                }`}
              >
                {tier.highlighted && (
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 opacity-75">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-serif font-bold mb-1">{tier.name}</h3>
                <div className="text-4xl font-bold mb-2">{tier.price}</div>
                <p
                  className={`text-sm mb-8 ${
                    tier.highlighted ? 'text-white/80' : 'text-dark-400'
                  }`}
                >
                  {tier.description}
                </p>
                <ul className="space-y-3 flex-1 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 flex-shrink-0 ${
                          tier.highlighted ? 'text-white' : 'text-primary-400'
                        }`}
                      >
                        ✓
                      </span>
                      <span className={tier.highlighted ? 'text-white/90' : 'text-dark-300'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleEnroll(tier)}
                  disabled={enrolling}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all disabled:opacity-50 ${
                    tier.highlighted
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'bg-primary-500 text-white hover:bg-primary-400'
                  }`}
                >
                  {enrolling ? 'Processing…' : tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-dark-400 text-sm mt-10"
          >
            All tiers include lifetime access. Questions?{' '}
            <Link to="/booking" className="text-primary-400 underline">
              Book a free consultation
            </Link>
            .
          </motion.p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-4">
            The cipher is open
          </p>
          <h2 className="text-5xl font-serif font-bold text-dark-900 mb-6">Step In.</h2>
          <p className="text-dark-600 text-xl leading-relaxed mb-10">
            Once you are in the cipher, you are held. And what is held can heal.
          </p>
          <a href="#pricing" className="btn btn-primary px-12 py-4 text-lg">
            Choose Your Path
          </a>
        </motion.div>
      </section>
    </div>
  );
}
