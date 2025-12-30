import stripe from '../config/stripe.mjs';
import express from 'express';
import tourRepo from '../app/repositories/tour.repo.mjs';

// Stripe webhook handler
export const stripeWebhook = express.raw({ type: 'application/json' });

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      // Save payment details in DB
      await tourPaymentRepo.create({
        tourRequestId: metadata.tourRequestId || null,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // convert cents to dollars
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        buyerId: metadata.buyerId || null,
        agentId: metadata.agentId || null,
      });
      break;
    }
    // Add more event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}
