import { motion } from 'framer-motion';
import { useState } from 'react';

export default function EventsPage() {
  const [filter, setFilter] = useState('all');

  const events = [
    {
      id: '1',
      title: 'The Open Cipher — Monthly Webinar',
      type: 'webinar',
      date: '2026-04-15',
      time: '7:00 PM EST',
      duration: '90 minutes',
      attendees: 120,
      price: 0,
      image: '◯',
      description:
        'In hip-hop, a cipher is an open circle — anyone can step in and contribute. This monthly webinar is that circle. A live, open gathering to decode patterns, share tools, and elevate each other. Free to attend.',
    },
    {
      id: '2',
      title: 'Breaking the Code — Station 3 Deep Dive',
      type: 'workshop',
      date: '2026-04-22',
      time: '6:00 PM EST',
      duration: '2 hours',
      attendees: 40,
      price: 29,
      image: '🔍',
      description:
        'A focused workshop on trauma responses and daily triggers. We\'ll build your Trigger Tracker together, live. Evidence-informed. Practically grounded.',
    },
    {
      id: '3',
      title: 'The Cipher Summit — Spring 2026',
      type: 'summit',
      date: '2026-05-10',
      time: '10:00 AM EST',
      duration: 'Full Day',
      attendees: 250,
      price: 97,
      image: '✦',
      description:
        'A full-day gathering of healers, barbers, and men committed to breaking generational cycles. Multi-speaker. Practical sessions. The lineage made visible.',
    },
    {
      id: '4',
      title: 'The Cipher Retreat — The Factory',
      type: 'retreat',
      date: '2026-06-06',
      time: 'Friday–Sunday',
      duration: '3 days',
      attendees: 30,
      price: 497,
      image: '🌿',
      description:
        'Immersive. Intimate. Three days at The Factory: the full 6-station journey delivered live, in community, with the Cypher and a cohort of 30. Applications only.',
    },
    {
      id: '5',
      title: 'Legacy Letter Workshop',
      type: 'workshop',
      date: '2026-04-29',
      time: '7:00 PM EST',
      duration: '2 hours',
      attendees: 35,
      price: 29,
      image: '📝',
      description:
        'Station 6 made live. We write our Legacy Letters together. You will declare what you choose to pass down and what you choose to end — in community, in the cipher.',
    },
    {
      id: '6',
      title: 'The Inner Circle — Quarterly Gathering',
      type: 'inner-circle',
      date: '2026-05-01',
      time: '6:00 PM EST',
      duration: '3 hours',
      attendees: 20,
      price: 0,
      image: '💎',
      description:
        'Exclusive to Inner Circle members. Quarterly deep-dive with the Cypher, peer accountability, and direct access. The circle, sustained.',
    },
  ];

  const types = [
    { id: 'all', label: 'All Events' },
    { id: 'webinar', label: 'The Open Cipher' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'summit', label: 'Summit' },
    { id: 'retreat', label: 'Retreat' },
    { id: 'inner-circle', label: 'Inner Circle' },
  ];

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 uppercase tracking-widest">
            The Stage & Inner Circle
          </div>
          <h1 className="text-5xl font-serif font-bold mb-3">The Cipher is Open</h1>
          <p className="text-xl text-dark-600 max-w-2xl">
            A cipher, in the tradition of hip-hop, is a circle of artists freestyling together —
            each one elevating the next. These gatherings are that circle. Step in.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap gap-3 mt-8">
          {types.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilter(type.id)}
              className={`px-6 py-2 rounded-full border-2 transition ${
                filter === type.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-dark-300 text-dark-700 hover:border-primary-500'
              }`}
            >
              {type.label}
            </motion.button>
          ))}
        </div>

        {/* Events */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filtered.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card card-hover overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8">
                <div className="flex items-center justify-center bg-primary-50 rounded-lg h-40 md:h-auto text-5xl font-serif text-primary-400">
                  {event.image}
                </div>

                <div className="md:col-span-2">
                  <div className="flex gap-2 mb-3">
                    <span className="badge badge-primary capitalize">{event.type.replace('-', ' ')}</span>
                    {event.attendees > 100 && (
                      <span className="badge badge-success">Featured</span>
                    )}
                    {event.price === 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        Free
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">{event.title}</h3>
                  <p className="text-dark-600 mb-4">{event.description}</p>
                  <div className="space-y-1 text-sm text-dark-600">
                    <div>📅 {event.date} • {event.time}</div>
                    <div>⏱ Duration: {event.duration}</div>
                    <div>👥 {event.attendees} in the cipher</div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <div className="text-3xl font-bold text-primary-500">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary mt-4"
                  >
                    {event.type === 'retreat' ? 'Apply' : 'Register'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

