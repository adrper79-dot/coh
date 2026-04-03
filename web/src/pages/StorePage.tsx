import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCartStore } from '@/stores/cart';

export default function StorePage() {
  const [filter, setFilter] = useState('all');
  const addItem = useCartStore((state) => state.addItem);

  const products = [
    {
      id: '1',
      name: 'The Cipher of Healing — Course',
      price: 197.00,
      image: '◯',
      category: 'course',
      description: 'The full 6-station self-paced course: Transforming Trauma into Resilience. 12–18 hours. Tools, exercises, and a Legacy Letter framework included.',
    },
    {
      id: '2',
      name: 'Restoration Oil — Signature Blend',
      price: 42.00,
      image: '🫙',
      category: 'oils',
      description: 'The barbershop formulation used in every session. Beard and scalp restoration oil. When you apply it yourself, the healing continues.',
    },
    {
      id: '3',
      name: 'Restoration Oil — Growth Formula',
      price: 38.00,
      image: '🫙',
      category: 'oils',
      description: 'Strengthening and nourishing oil for hair and beard. Cold-pressed. No sulfates. A daily ritual of care made tangible.',
    },
    {
      id: '4',
      name: 'The Cipher of Healing — Book',
      price: 24.00,
      image: '📖',
      category: 'books',
      description: 'The companion text to the course. A guide to decoding the language of your own life — the code, the zero, and the circle.',
    },
    {
      id: '5',
      name: 'Barbershop Grooming Kit',
      price: 89.00,
      image: '✂️',
      category: 'kits',
      description: 'The full setup: restoration oil, edge brush, beard comb, and styling balm. To care for your appearance is not vanity — it is declaration.',
    },
    {
      id: '6',
      name: 'The Trigger Tracker — Journal',
      price: 18.00,
      image: '📓',
      category: 'books',
      description: 'The physical Trigger Tracker and Awareness Journal from Station 3. Track your responses, decode your patterns, begin to choose.',
    },
    {
      id: '7',
      name: 'Styling Balm — The Factory Formula',
      price: 28.00,
      image: '🫙',
      category: 'oils',
      description: 'Medium-hold styling balm with restorative botanicals. Finish your look. Declare your intention.',
    },
    {
      id: '8',
      name: 'Legacy Letter Workbook',
      price: 22.00,
      image: '📝',
      category: 'books',
      description: 'The guided workbook for crafting your Legacy Letter and Cipher Statement from Station 6. What you pass down. What you choose to end.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'course', label: 'Course' },
    { id: 'oils', label: 'Oils & Grooming' },
    { id: 'kits', label: 'Kits' },
    { id: 'books', label: 'Books & Journals' },
  ];

  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 uppercase tracking-widest">
            The Vault
          </div>
          <h1 className="text-5xl font-serif font-bold mb-3">Tools of Restoration</h1>
          <p className="text-xl text-dark-600 max-w-2xl">
            These are not retail products. They are extensions of the restoration. The outer is a
            reflection of the inner — and we choose to dress valuable because we are valuable.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap gap-3 mt-8">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2 rounded-full border-2 transition ${
                filter === cat.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-dark-300 text-dark-700 hover:border-primary-500'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              className="card card-hover overflow-hidden"
            >
              <div className="bg-primary-50 h-40 flex items-center justify-center text-5xl font-serif text-primary-400">
                {product.image}
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-dark-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-500">${product.price.toFixed(0)}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addItem(product as any, 1)}
                    className="btn btn-primary text-sm"
                  >
                    Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Manifesto note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-l-4 border-primary-500 pl-8 py-2 max-w-3xl"
        >
          <p className="text-xl font-serif italic text-dark-700 leading-relaxed">
            "When a man takes home the oil that was used in his session and applies it himself, he
            is continuing the healing. He is saying: I am worth this care even when no one is
            watching."
          </p>
          <p className="mt-3 text-primary-600 font-semibold">— The Cipher of Healing</p>
        </motion.div>
      </div>
    </div>
  );
}

