import type { User } from '@supabase/supabase-js'
import type { PlanName } from '@/lib/stripe'

export type { User }

export interface Profile {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  bio: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  plan: PlanName
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive'
  currentPeriodEnd: string | null
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface StatsCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
}
