'use server'

import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import { absoluteUrl } from '@/lib/utils'
import { redirect } from 'next/navigation'
import type { PlanName } from '@/lib/stripe'

export async function createCheckoutSession(plan: PlanName) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planConfig = PLANS[plan]
  if (!planConfig.stripePriceId) return { error: 'Invalid plan' }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: absoluteUrl('/billing?success=true'),
    cancel_url: absoluteUrl('/billing'),
    customer_email: user.email,
    metadata: { userId: user.id },
  })

  if (session.url) redirect(session.url)
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get stripeCustomerId from your DB
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) return { error: 'No billing account found' }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: absoluteUrl('/billing'),
  })

  redirect(session.url)
}
