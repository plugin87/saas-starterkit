import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['5 projects', '1 GB storage', 'Basic analytics'],
    stripePriceId: null,
  },
  PRO: {
    name: 'Pro',
    price: 1900, // $19/month in cents
    features: ['Unlimited projects', '50 GB storage', 'Advanced analytics', 'Priority support'],
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
  },
  TEAM: {
    name: 'Team',
    price: 4900, // $49/month in cents
    features: ['Everything in Pro', 'Team collaboration', '200 GB storage', 'Custom integrations'],
    stripePriceId: process.env.STRIPE_PRICE_TEAM_MONTHLY,
  },
} as const

export type PlanName = keyof typeof PLANS
