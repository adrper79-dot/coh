import homeData from './data/home.json';
import showData from './data/show.json';
import founderData from './data/founder.json';
import booksData from './data/books.json';
import courseData from './data/course.json';

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

export interface FeaturedContent {
  eyebrow?: string;
  title: string;
  description: string;
  image: string;
}

export interface ShowEpisodeSeed {
  title: string;
  format: string;
  takeaway: string;
}

export interface FounderMilestone {
  label: string;
  detail: string;
}

export interface BookEntry {
  title: string;
  role: string;
  format: string;
  image: string;
  description: string;
  bestFor: string;
}

export const homeTestimonials = homeData.testimonials as Testimonial[];
export const pathwayRecommendations = homeData.pathwayRecommendations as Record<string, RouteRecommendation>;

export const showHero = showData.hero as FeaturedContent & { eyebrow: string };
export const showFeaturedEpisode = showData.featuredEpisode as FeaturedContent & {
  runtime: string;
  focus: string;
  ctaLabel: string;
  ctaPath: string;
};
export const showFormatPoints = showData.formatPoints as string[];
export const showGuardrails = showData.guardrails as string[];
export const showEpisodeSeeds = showData.episodeSeeds as ShowEpisodeSeed[];

export const founderHero = founderData.hero as FeaturedContent & { eyebrow: string };
export const founderBio = founderData.bio as string[];
export const founderPrinciples = founderData.principles as string[];
export const founderMilestones = founderData.milestones as FounderMilestone[];

export const booksHero = booksData.hero as { eyebrow: string; title: string; description: string };
export const booksCollection = booksData.books as BookEntry[];
export const booksChannelStrategy = booksData.channelStrategy as string;

export const courseFallbackContent = courseData as {
  title: string;
  description: string;
  quote: string;
  stats: Array<{ label: string; value: string }>;
  stations: Array<{ num: string; title: string; desc: string }>;
  testimonials: Testimonial[];
  pricingTiers: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
    cta: string;
    highlighted: boolean;
    action: 'enroll' | 'apply';
  }>;
};