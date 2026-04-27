import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', {
  apiVersion: '2023-10-16',
})

// Candor payment constants (in pence)
export const PAYMENTS = {
  PITCH_READ: 270,        // £2.70
  PITCH_FEEDBACK: 710,    // £7.10
  HIRE_CONFIRMED: 3000,   // £30.00
  FREELANCE_HIRE: 2500,   // £25.00
  COMMUNITY_ANSWER: 1500, // £15.00
  OFFICE_HOURS: 3000,     // £30.00
  CASE_STUDY: 2000,       // £20.00
  MIN_WITHDRAWAL: 5000,   // £50.00
  EXPERT_TAKE_RATE: 0.10, // 10%
  SPONSORED_PROBLEM_TAKE: 0.40, // Candor keeps 40%, winner gets 60%
} as const

// Company pitch prices (in pence)
export const PITCH_PRICES = {
  EMPLOYMENT: 5000,  // £50
  FREELANCE: 3500,   // £35
} as const

// Subscription plans (in pence per month)
export const PLAN_PRICES = {
  STARTER: 29900,    // £299
  GROWTH: 79900,     // £799
  ENTERPRISE: 200000, // £2,000
  CANDIDATE_PRO: 999, // £9.99
  CANDIDATE_EXPERT: 2499, // £24.99
} as const
