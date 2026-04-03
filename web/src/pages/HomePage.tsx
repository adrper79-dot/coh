import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-dark-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium mb-6">
              ✨ Transform Your Inner World Outward
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-bold text-dark-900 mb-6 leading-tight">
              The Outer is a Reflection of the Inner
            </h1>
            <p className="text-xl md:text-3xl text-dark-700 mb-8 font-light max-w-3xl mx-auto">
              Unlock your potential through consciousness, healing, and personal transformation
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
            <Link to="/booking" className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-2xl transition">
              Start Your Journey
            </Link>
            <Link to="/academy" className="btn btn-outline text-lg px-8 py-4 border-2 hover:bg-primary-50 transition">
              Begin Learning
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center gap-8 text-sm text-dark-600 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-primary-500 text-xl">◆</span>
              The Chair. The Vault. The Academy.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-500 text-xl">◆</span>
              The Stage. The Inner Circle.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-500 text-xl">◆</span>
              One cipher. Step in.
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Five Streams Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-dark-900">
              Five Streams of Transformation
            </h2>
            <p className="text-xl md:text-2xl text-dark-600 max-w-2xl mx-auto">
              Discover the path that aligns with your consciousness and healing goals
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                title: 'The Chair',
                description: 'The barbershop session as sanctuary. Precision work attended to with care — and a conversation that goes wherever it needs to go.',
                icon: '✂️',
                link: '/booking',
                highlight: 'Most Popular',
              },
              {
                title: 'The Vault',
                description: 'Restoration oils, books, journals, and grooming kits. Extensions of the healing, not retail products.',
                icon: '🫙',
                link: '/store',
              },
              {
                title: 'The Academy',
                description: 'The Cipher of Healing: Transforming Trauma into Resilience. Six stations. 12–18 hours. A process, not a product.',
                icon: '◯',
                link: '/academy',
                highlight: 'Best Value',
              },
              {
                title: 'The Stage',
                description: 'The Open Cipher — live webinars, workshops, and summits. The circle, open. Anyone can step in.',
                icon: '✦',
                link: '/events',
              },
              {
                title: 'The Inner Circle',
                description: 'Quarterly gatherings, direct access, and the retreat at The Factory. The cipher, sustained.',
                icon: '◆',
                link: '/events',
                highlight: 'Premium',
              },
            ].map((stream, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -15, boxShadow: '0 25px 50px rgba(195, 155, 105, 0.15)' }}
                className="relative group cursor-pointer"
                onClick={() => (window.location.href = stream.link)}
              >
                <div className={`h-full rounded-2xl p-8 transition-all duration-300 ${
                  stream.highlight 
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl' 
                    : 'bg-white border-2 border-primary-100 group-hover:border-primary-300'
                }`}>
                  {stream.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white text-primary-600 text-xs font-bold rounded-full whitespace-nowrap">
                      {stream.highlight}
                    </div>
                  )}
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform cursor-pointer">
                    {stream.icon}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-3">
                    {stream.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 font-medium ${
                    stream.highlight ? 'text-white/90' : 'text-dark-600'
                  }`}>
                    {stream.description}
                  </p>
                  <div className={`text-sm font-bold transition-all duration-300 ${
                    stream.highlight ? 'text-white' : 'text-primary-600 group-hover:text-primary-700'
                  }`}>
                    Explore →
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-dark-900">
              From the Cipher
            </h2>
            <p className="text-xl text-dark-700">
              What happens when a man sits down in the chair and lets the healing begin
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                quote: "I came in for a cut and left having talked about my father for the first time in years. That's not a barbershop. That's a sanctuary.",
                author: "Marcus T.",
                role: "The Chair",
                rating: 5,
              },
              {
                quote: "Station 3 broke something open in me. I finally understood why I react the way I do. The Trigger Tracker changed my relationships.",
                author: "DeShawn W.",
                role: "The Academy",
                rating: 5,
              },
              {
                quote: "The restoration oil sits on my bathroom shelf. Every morning I use it, I remember — I am worth this care even when no one is watching.",
                author: "Jordan M.",
                role: "The Vault",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary-500 text-xl">★</span>
                  ))}
                </div>
                <p className="text-dark-800 text-lg mb-6 font-light italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-primary-100 pt-4">
                  <p className="font-serif font-bold text-dark-900">{testimonial.author}</p>
                  <p className="text-primary-600 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results/Impact Section */}
      <section className="py-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-dark-900">
              The Lineage. The Platform. The Work.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: '6', label: 'Stations of Restoration' },
              { number: '5', label: 'Streams of Access' },
              { number: '1', label: 'Ancient Lineage — Restored' },
              { number: '◯', label: 'The cipher is open' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-serif font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <p className="text-dark-700 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            The cipher is open.<br />Step in.
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-primary-100 font-light">
            Once you are in the cipher, you are held. And what is held can heal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="btn bg-white text-primary-600 hover:bg-dark-50 text-lg px-8 py-4">
              Book a Consultation
            </Link>
            <Link to="/academy" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              Explore Academy
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
