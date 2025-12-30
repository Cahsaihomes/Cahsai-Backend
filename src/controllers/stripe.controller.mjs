// --- Tour Booking Payment Flow ---
// 1. Frontend uses Stripe.js/Elements to collect card details and create a PaymentMethod.
// 2. Frontend sends { tourId, paymentMethodId } to backend.
// 3. Backend creates and confirms the PaymentIntent using paymentMethodId.
// 4. Backend responds with payment result.

// Controller for Stripe Connect onboarding
import stripe from '../config/stripe.mjs';
import userRepo from "../app/repositories/user.repo.mjs";

export async function createStripeAccountLink(req, res) {
  try {
    // Assume agentId is available in req.user or req.body
    const agentId = req.user?.id || req.body.agentId;

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: req.user?.email || req.body.email,
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.ONBOARDING_REFRESH_URL}/reauth`,
      return_url: `${process.env.ONBOARDING_RETURN_URL}/return`,
      type: 'account_onboarding',
    });
 
    
    await userRepo.updateUser(agentId, { stripeAccountId: account.id });

    res.json({ url: accountLink.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// Tour booking payment controller
export async function tourBookPayment(req, res) {
  try {
    const { tourId, paymentMethodId } = req.body;
    if (!tourId || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields: tourId, paymentMethodId' });
    }
    // Create a payment intent (amount and currency should be dynamic)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // Example: $100.00
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { tourId },
    });
    res.json({ success: true, paymentIntent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}