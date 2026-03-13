import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role credentials are not set')
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Only grant Pro for subscription checkouts, not one-time payments
        if (session.mode !== 'subscription') break
        const userId = session.metadata?.supabase_user_id
        if (!userId) break

        await getSupabaseAdmin()
          .from('user_profiles')
          .upsert({
            id: userId,
            is_pro: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            pro_since: new Date().toISOString(),
          })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        // Match on subscription ID (not just customer) to handle multi-subscription edge cases
        await getSupabaseAdmin()
          .from('user_profiles')
          .update({ is_pro: false, stripe_subscription_id: null })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        // Optional: send a notification or mark account as past-due
        // For now, we only revoke on explicit cancellation
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
