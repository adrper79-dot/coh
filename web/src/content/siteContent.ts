export interface Testimonial {
  quote: string;
  name: string;
  via: string;
}

export interface RouteRecommendation {
  title: string;
  description: string;
  path: string;
  cta: string;
}

export const homeTestimonials: Testimonial[] = [
  {
    quote:
      'I came in for a cut and left having talked about my father for the first time in years. That was the first place I felt safe enough to say it out loud.',
    name: 'Marcus T.',
    via: 'The Chair',
  },
  {
    quote:
      'Station 3 broke something open in me. I finally understood why I react the way I do. The Trigger Tracker changed my relationships.',
    name: 'DeShawn W.',
    via: 'The Academy',
  },
  {
    quote:
      'The restoration oil sits on my bathroom shelf. Every morning I use it, I remember that care is something I can practice, not just receive.',
    name: 'Jordan M.',
    via: 'The Vault',
  },
];

export const showFormatPoints = [
  'A client enters the chair and a real theme is named.',
  'The service unfolds with dignity, rhythm, and conversation.',
  'The episode stays grounded in reflection, not spectacle.',
  'Each conversation ends with a clear Cipher takeaway.',
];

export const showGuardrails = [
  'The show is educational and reflective, not therapy.',
  'Conversations should honor consent, dignity, and non-exploitative storytelling.',
  'The point is restoration and understanding, not emotional performance.',
  'The show is a front door into the wider Cypher of Healing ecosystem.',
];

export const showEpisodeSeeds = [
  {
    title: 'The Chair and the Father Wound',
    format: 'Barber-chair conversation',
    takeaway: 'Naming what was inherited is often the first act of restoration.',
  },
  {
    title: 'Why Men Perform Strength Instead of Practice It',
    format: 'Guided reflection episode',
    takeaway: 'Discipline without reflection becomes armor instead of growth.',
  },
  {
    title: 'Style, Dignity, and the Outer Reflection',
    format: 'Ritual and grooming episode',
    takeaway: 'How you carry yourself can reinforce what you believe about your worth.',
  },
];

export const pathwayRecommendations: Record<string, RouteRecommendation> = {
  chair: {
    title: 'Start with the Chair',
    description:
      'You likely need embodied trust first: ritual, presence, grooming, and a real conversation in a human space.',
    path: '/booking',
    cta: 'Book a Session',
  },
  academy: {
    title: 'Enter the Academy',
    description:
      'You likely want language, structure, and a repeatable framework for decoding the patterns underneath your life.',
    path: '/academy',
    cta: 'Explore the Course',
  },
  vault: {
    title: 'Begin with the Vault',
    description:
      'You likely want tactile tools, books, and daily reminders that help you carry the work into ordinary life.',
    path: '/books',
    cta: 'Explore Books and Tools',
  },
  show: {
    title: 'Watch the Show',
    description:
      'You likely need a low-friction way to feel the voice, worldview, and emotional texture of the brand before choosing a deeper step.',
    path: '/show',
    cta: 'Explore the Show',
  },
  circle: {
    title: 'Join a Gathering',
    description:
      'You likely want communal learning, live reflection, and accountability with others entering the same work.',
    path: '/events',
    cta: 'View Gatherings',
  },
};

export const courseFallbackContent = {
  title: 'The Cipher of Healing',
  description:
    'A 6-station guided journey that decodes the language of your wounds, inhabits the zero of the present, and restores the future you were always meant to live.',
  quote:
    'A cipher is code. A zero. A circle. This course gives you both the key and the courage to use it.',
  stats: [
    { label: 'Format', value: 'Video + Workbook' },
    { label: 'Access', value: 'Lifetime' },
    { label: 'Level', value: 'All levels' },
    { label: 'Certificate', value: 'Yes, upon completion' },
  ],
  stations: [
    { num: '01', title: 'The Cipher Framework', desc: 'Set your intention. Learn what the cipher means — as code, as zero, as circle. Make the commitment to honesty.' },
    { num: '02', title: 'Roots of the Past', desc: 'Map your wounds without re-living them. Childhood patterns, family roles, attachment styles — the code you inherited.' },
    { num: '03', title: 'Breaking the Code', desc: 'Recognize trauma responses in daily life. Name the triggers. Close the gap between stimulus and choice.' },
    { num: '04', title: 'Healing in Motion', desc: 'Mind-body reset. Cognitive reframing. Rewriting beliefs that were never yours to begin with.' },
    { num: '05', title: 'Rebuilding Resilience', desc: 'Daily habits that compound. Boundaries as love. The 30-day tracker that keeps the fresh cut clean.' },
    { num: '06', title: 'The Cipher of the Future', desc: 'Visualize the healed self. Write your Legacy Letter. Declare what you pass forward — and what ends with you.' },
  ],
  testimonials: [
    {
      quote:
        "I've done therapy, journaling, all of it. The Cipher was different. It didn't just ask me to feel — it asked me to decode. By Station 3, I could name what I was doing in real time.",
      name: 'Kezia M.',
      via: 'The Cipher',
    },
    {
      quote:
        "The Legacy Letter I wrote in Station 6 is the most important thing I've ever put on paper. I never thought about healing as something I was doing for my children too.",
      name: 'David R.',
      via: 'Guided Integration',
    },
    {
      quote:
        "Station 5 — the resilience practice — is now my morning. I didn't think I was capable of daily practice, but this made it feel like self-respect, not punishment.",
      name: 'Amara J.',
      via: 'Immersion Circle',
    },
  ] as Testimonial[],
  pricingTiers: [
    {
      name: 'The Cipher',
      price: '$197',
      description: 'Full course access, self-paced for life',
      features: [
        'All 6 stations of content',
        'Downloadable workbooks and exercises',
        'Lifetime access',
        'Certificate of completion',
      ],
      cta: 'Enroll Now',
      highlighted: false,
      action: 'enroll' as const,
    },
    {
      name: 'The Cipher + Guided Integration',
      price: '$297',
      description: 'Course plus one private integration session',
      features: [
        'Everything in The Cipher',
        '1 private guided integration session (60 min)',
        'Personalized integration plan',
        'Priority email support',
        'Access to community forums',
      ],
      cta: 'Enroll + Book Session',
      highlighted: true,
      action: 'enroll' as const,
    },
    {
      name: 'The Immersion Circle',
      price: '$497',
      description: 'Deep-dive with ongoing support',
      features: [
        'Everything in Cipher + Guided Integration',
        '3 private guided integration sessions',
        'Weekly group accountability call',
        'Custom resilience blueprint',
        'Inner Circle community access',
      ],
      cta: 'Apply for Immersion',
      highlighted: false,
      action: 'apply' as const,
    },
  ],
};