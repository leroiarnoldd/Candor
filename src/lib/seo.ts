import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.getcandor.net'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcandor.net'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Candor — The job comes to you.',
    template: '%s — Candor',
  },
  description: 'Companies apply to you. Salary on the first message. Anonymous until you choose otherwise. Earn from every pitch. The job comes to you.',
  keywords: [
    'candor', 'jobs', 'hiring', 'recruitment', 'salary transparency',
    'candidate first', 'anonymous job search', 'get paid to interview',
    'UK jobs', 'professional platform', 'career'
  ],
  authors: [{ name: 'LeRoi Arnold', url: SITE_URL }],
  creator: 'Candor',
  publisher: 'Candor',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'Candor',
    title: 'Candor — The job comes to you.',
    description: 'Companies apply to you. Salary on the first message. Earn from every pitch.',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Candor — The job comes to you.',
    description: 'Companies apply to you. Salary on the first message. Earn from every pitch.',
    creator: '@getcandor',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

// Page-specific metadata
export const pageMetadata = {
  home: {
    title: 'Candor — The job comes to you.',
    description: 'Companies apply to you. Salary on the first message. Anonymous until you choose otherwise. Earn £2.70 to read a pitch, £7.10 for feedback, £30 when hired.',
  },
  signup: {
    title: 'Join Candor — Get hired differently',
    description: 'Create your free Candor profile. Companies pitch you with real salaries. You stay anonymous. You earn from every engagement.',
  },
  login: {
    title: 'Sign in to Candor',
    description: 'Welcome back. Sign in to your Candor account.',
  },
  howItWorks: {
    title: 'How Candor works — The job comes to you',
    description: 'Five steps. Companies apply to you. Salary on the first message. You earn from every pitch. Here is exactly how it works.',
  },
  forCompanies: {
    title: 'Candor for Companies — Hire verified professionals',
    description: 'Pitch verified professionals with salary on the first message. Higher response rates. Real accountability. Three plans from £299/month.',
  },
  earnings: {
    title: 'Candidate earnings on Candor — Get paid to be found',
    description: '£2.70 to read a pitch. £7.10 for structured feedback. £30 on confirmed hire. The only recruitment platform that pays candidates.',
  },
  learn: {
    title: 'Candor Learn — Skill verification engine',
    description: 'Not a course platform. A skill verification engine. Identify gaps, fill them with expert-led programmes, earn permanent verified skill badges.',
  },
  universities: {
    title: 'Candor for Universities — Real graduate employment',
    description: '£2,000/year per institution. Real employer pitches, skill verification, and £30 when students land their first job.',
  },
  transparency: {
    title: 'The Candor Transparency Report — The data both giants hide',
    description: 'Published quarterly. Names the best companies. Names the ghosters. Salary accuracy index. The data no other platform will publish.',
  },
  community: {
    title: 'Candor Communities — High-signal professional rooms',
    description: 'Verified professionals. Expert answers. Sponsored problems. Get paid for what you know.',
  },
  salary: {
    title: 'Salary Intelligence — What companies actually offer',
    description: 'Not surveys. Real verified salary data from real pitches. Median, percentile breakdowns by role. Updated in real time.',
  },
  about: {
    title: 'About Candor — Built for the people doing the work',
    description: 'Candor is a candidate-first professional platform. Companies apply to you. The people doing the work hold the power.',
  },
}

// Structured data for SEO
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Candor',
    url: SITE_URL,
    description: 'Candidate-first professional platform. Companies apply to you.',
    foundingDate: '2026',
    founder: {
      '@type': 'Person',
      name: 'LeRoi Arnold',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@getcandor.net',
    },
  }
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Candor',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/salary?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateJobPlatformSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Candor',
    url: BASE_URL,
    applicationCategory: 'BusinessApplication',
    description: 'Candidate-first professional platform. Companies pitch candidates with salary on the first message.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free for candidates',
    },
  }
}
