import stripe from '../config/stripe.mjs';

export async function payForTour(req, res) {
  try {
    const { agentStripeAccountId, buyerId, agentId, postId, date, time } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 200, // $2 in cents
      currency: 'usd',
      payment_method_types: ['card'],
      transfer_data: {
        destination: agentStripeAccountId,
      },
      application_fee_amount: 100, // $1 to admin
      metadata: {
        buyerId,
        agentId,
        postId,
        date,
        time
      },
    });

    res.json({
      paymentIntent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
