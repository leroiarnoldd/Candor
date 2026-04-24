import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      // Company subscription created
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const { company_id, plan, pitch_credits } = session.metadata || {}

        if (company_id && plan) {
          await supabaseAdmin
            .from('company_profiles')
            .update({
              plan: plan as any,
              pitch_credits: parseInt(pitch_credits || '0'),
              plan_started_at: new Date().toISOString(),
              plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', company_id)
        }
        break
      }

      // Subscription renewed — replenish credits
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Find company by Stripe customer ID
        // In production you'd store the stripe_customer_id on company_profiles
        console.log('Invoice paid for customer:', customerId)
        break
      }

      // Candidate payout completed
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        const transferId = transfer.id

        // Find and complete the matching withdrawal transaction
        const { data: transactions } = await supabaseAdmin
          .from('wallet_transactions')
          .select('*')
          .eq('stripe_transfer_id', transferId)
          .eq('status', 'pending')

        if (transactions && transactions.length > 0) {
          await supabaseAdmin
            .from('wallet_transactions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('stripe_transfer_id', transferId)
        }
        break
      }

      // Payment failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
