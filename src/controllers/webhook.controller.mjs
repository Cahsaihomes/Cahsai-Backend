import stripe from '../config/stripe.mjs';
import express from 'express';
import tourRepo from '../app/repositories/tour.repo.mjs';
import * as tourService from '../app/services/tour.service.mjs';
import { sequelize } from '../models/userModel/index.mjs';

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
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    }
    case 'payment_intent.payment_failed': {
      await handlePaymentIntentFailed(event.data.object);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

/**
 * Handle successful payment intent
 * For lead claims, update the lead with payment metadata
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  const transaction = await sequelize.transaction();
  try {
    const metadata = paymentIntent.metadata || {};
    const type = metadata.type;

    console.log(`💳 Payment Intent Succeeded: ${paymentIntent.id}`);
    console.log(`   Type: ${type}`);
    console.log(`   Metadata:`, metadata);

    if (type === 'lead_claim') {
      // Handle lead claim payment
      const leadId = metadata.leadId;
      const agentId = metadata.agentId;
      const propertyPrice = metadata.propertyPrice;
      const amount = paymentIntent.amount / 100; // Convert cents to dollars

      console.log(`🎯 Processing lead claim payment - Lead: ${leadId}, Agent: ${agentId}, Amount: $${amount}`);

      // Update lead with claim payment information
      const [updatedCount] = await tourRepo.updateLeadWithPayment(
        leadId,
        {
          claim_status: 'claimed',
          claimed_by_agent_id: agentId,
          claim_fee: amount,
          payment_intent_id: paymentIntent.id,
          claimed_at: new Date(),
          payment_status: 'success',
          activeLead: true, // Mark as active lead
        },
        { transaction }
      );

      if (updatedCount === 0) {
        console.error(`❌ Lead not found: ${leadId}`);
        await transaction.rollback();
        return;
      }

      // Create audit record in LeadPayments table
      const LeadPayment = sequelize.models.LeadPayment;
      if (LeadPayment) {
        await LeadPayment.create(
          {
            leadId: parseInt(leadId),
            agentId: parseInt(agentId),
            paymentIntentId: paymentIntent.id,
            propertyPrice: propertyPrice ? parseFloat(propertyPrice) : null,
            claimFee: amount,
            paymentStatus: 'success',
            stripeResponse: paymentIntent,
          },
          { transaction }
        );
        console.log(`📝 Lead payment audit record created for Lead: ${leadId}`);
      }

      await transaction.commit();
      console.log(`✅ Lead claim updated successfully - Lead: ${leadId}`);

    } else if (type === 'tour_booking') {
      // Handle tour booking payment (existing logic)
      await tourPaymentRepo.create({
        tourRequestId: metadata.tourRequestId || null,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        buyerId: metadata.buyerId || null,
        agentId: metadata.agentId || null,
      });
      console.log(`✅ Tour booking payment recorded`);
    }

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error handling payment_intent.succeeded webhook:', error.message);
    console.error(error.stack);
  }
}

/**
 * Handle failed payment intent
 * For lead claims, update the lead with failed payment status
 */
async function handlePaymentIntentFailed(paymentIntent) {
  const transaction = await sequelize.transaction();
  try {
    const metadata = paymentIntent.metadata || {};
    const type = metadata.type;

    console.log(`❌ Payment Intent Failed: ${paymentIntent.id}`);
    console.log(`   Type: ${type}`);
    console.log(`   Metadata:`, metadata);

    if (type === 'lead_claim') {
      // Handle lead claim payment failure
      const leadId = metadata.leadId;
      const agentId = metadata.agentId;

      console.log(`🎯 Processing lead claim payment failure - Lead: ${leadId}, Agent: ${agentId}`);

      // Update lead with failed payment status
      const [updatedCount] = await tourRepo.updateLeadWithPayment(
        leadId,
        {
          payment_intent_id: paymentIntent.id,
          payment_status: 'failed',
          claim_status: 'unclaimed', // Lead remains unclaimed on failed payment
        },
        { transaction }
      );

      if (updatedCount === 0) {
        console.error(`❌ Lead not found: ${leadId}`);
        await transaction.rollback();
        return;
      }

      // Create audit record in LeadPayments table
      const LeadPayment = sequelize.models.LeadPayment;
      if (LeadPayment) {
        await LeadPayment.create(
          {
            leadId: parseInt(leadId),
            agentId: parseInt(agentId),
            paymentIntentId: paymentIntent.id,
            propertyPrice: metadata.propertyPrice ? parseFloat(metadata.propertyPrice) : null,
            claimFee: paymentIntent.amount / 100,
            paymentStatus: 'failed',
            stripeResponse: paymentIntent,
          },
          { transaction }
        );
        console.log(`📝 Lead payment failure audit record created for Lead: ${leadId}`);
      }

      await transaction.commit();
      console.log(`✅ Lead payment failure recorded - Lead: ${leadId}`);
    }

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error handling payment_intent.payment_failed webhook:', error.message);
    console.error(error.stack);
  }
}
