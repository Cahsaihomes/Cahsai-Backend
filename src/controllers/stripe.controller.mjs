import stripe from '../config/stripe.mjs';

export async function tourBookPayment(req, res) {
  console.log('=== TOUR BOOK PAYMENT STARTED ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { paymentMethodId, postId, agentId, date, time, consent } = req.body;
    
    // Validate required fields
    if (!paymentMethodId) {
      console.error('Missing paymentMethodId');
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required field: paymentMethodId' 
      });
    }

    if (!postId || !agentId || !date || !time) {
      console.error('Missing required fields:', { postId, agentId, date, time });
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields: postId, agentId, date, or time' 
      });
    }

    console.log('Creating payment intent (without agent lookup for now)...');
    
    // Create payment intent WITHOUT agent lookup
    const paymentIntentData = {
      amount: 200, // $2.00 in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: { 
        postId: postId?.toString() || '',
        agentId: agentId?.toString() || '',
        buyerId: req.user?.id?.toString() || 'guest',
        date: date || '',
        time: time || '',
      },
    };

    // Create and confirm payment intent with Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      return res.status(400).json({
        status: 'error',
        message: stripeError.message || 'Payment processing failed'
      });
    }

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded!');
      
      // TODO: Save tour booking to database here
      // You'll need to implement this based on your database setup
      
      console.log('=== TOUR BOOK PAYMENT COMPLETED SUCCESSFULLY ===');
      
      return res.status(200).json({ 
        status: 'success',
        message: 'Payment successful and tour booked',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
        },
      });
    } else {
      console.error('Payment not successful. Status:', paymentIntent.status);
      return res.status(400).json({ 
        status: 'error',
        message: `Payment was not successful. Status: ${paymentIntent.status}`,
      });
    }

  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN TOUR BOOK PAYMENT ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

// Keep your existing createStripeAccountLink function
export async function createStripeAccountLink(req, res) {
  try {
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
 
    // TODO: Update this when you know the correct function name
    // await userRepo.updateUser(agentId, { stripeAccountId: account.id });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe account link error:', error);
    res.status(500).json({ error: error.message });
  }
}