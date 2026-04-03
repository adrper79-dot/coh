import { motion } from 'framer-motion';
import { useState } from 'react';

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const services = [
    {
      id: '1',
      name: 'The Chair — Signature Session',
      duration: 60,
      price: 75,
      description: 'The full barbershop experience rooted in the lineage. Precision cut, beard work, and restoration oil treatment. The consultation is part of the session.',
    },
    {
      id: '2',
      name: 'The Cipher Consultation',
      duration: 90,
      price: 150,
      description: 'One-on-one with the Cypher. Deep, deliberate healing work — the ancient relationship of healer and seeker, restored. Includes a personalized Cipher framework session.',
    },
    {
      id: '3',
      name: 'The Chair + Cipher',
      duration: 120,
      price: 200,
      description: 'The complete offering. Begin in the chair, end with the cipher. Grooming and healing as one act — because they always were.',
    },
    {
      id: '4',
      name: 'Follow-Up Session',
      duration: 45,
      price: 60,
      description: 'Return to the chair. Continue the work. Maintain what you are building.',
    },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4 uppercase tracking-widest">
            The Chair
          </div>
          <h1 className="text-5xl font-serif font-bold mb-4">Book Your Session</h1>
          <p className="text-xl text-dark-600 max-w-2xl">
            Before the blade touches skin, there is always a consultation. Sit down. The barber's
            first act is to ask what you are carrying and what you are ready to release.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services */}
          <div className="lg:col-span-2">
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-serif font-bold mb-6">Select a Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedService === service.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-dark-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-bold mb-1">{service.name}</div>
                    <div className="text-sm text-dark-600 mb-2">
                      {service.duration} min • ${service.price}
                    </div>
                    {'description' in service && (
                      <div className="text-xs text-dark-500 leading-relaxed">
                        {(service as any).description}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="card p-8">
              <h2 className="text-2xl font-serif font-bold mb-6">Select Date</h2>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const isToday = i === 0;
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = date.getDate();

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-3 rounded-lg border-2 transition text-center ${
                        selectedDate === dateStr
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-dark-200 hover:border-primary-300'
                      } ${isToday ? 'bg-dark-100' : ''}`}
                    >
                      <div className="text-xs font-bold">{dayName}</div>
                      <div className="text-lg">{dayNum}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-8 h-fit sticky top-24">
            <h3 className="text-2xl font-serif font-bold mb-6">Booking Summary</h3>
            {selectedService && (
              <div className="space-y-4 mb-6">
                <div className="pb-4 border-b border-dark-200">
                  <div className="text-sm text-dark-600 mb-1">Service</div>
                  <div className="font-bold">
                    {services.find((s) => s.id === selectedService)?.name}
                  </div>
                </div>
                {selectedDate && (
                  <div className="pb-4 border-b border-dark-200">
                    <div className="text-sm text-dark-600 mb-1">Date</div>
                    <div className="font-bold">{selectedDate}</div>
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary w-full">
              {selectedService && selectedDate ? 'Continue to Checkout' : 'Select Service & Date'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
