import stripe from '../config/stripe.mjs';
import * as tourService from '../app/services/tour.service.mjs';

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
        message: 'Missing required field: paymentMethodId',
        code: 'MISSING_PAYMENT_METHOD'
      });
    }

    if (!postId || !agentId || !date || !time) {
      console.error('Missing required fields:', { postId, agentId, date, time });
      return res.status(400).json({ 
        status: 'error',
        message: 'Missing required fields: postId, agentId, date, or time',
        code: 'MISSING_FIELDS'
      });
    }

    const buyerId = req.user?.id || null;
    console.log(`Creating payment intent for buyer ${buyerId}...`);
    
    // First, verify the payment method exists
    let paymentMethod;
    try {
      console.log(`Verifying payment method: ${paymentMethodId}`);
      paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      console.log('Payment method verified:', paymentMethod.id);
    } catch (verifyError) {
      console.error('Failed to verify payment method:', verifyError.message);
      
      // If payment method doesn't exist, return error with instructions
      return res.status(400).json({
        status: 'error',
        message: `Payment method not found. The payment method may have been deleted or created in a different account. Please try again with a valid payment method or create a new one.`,
        code: 'INVALID_PAYMENT_METHOD',
        details: verifyError.message,
        action: 'CREATE_NEW_PAYMENT_METHOD',
        nextSteps: [
          '1. Create a new payment method using the createPaymentMethod endpoint',
          '2. Or use Stripe Elements on the frontend to create and tokenize a card',
          '3. Then retry the payment with the new payment method ID'
        ]
      });
    }

    // Create payment intent with the verified payment method
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
        buyerId: buyerId?.toString() || 'guest',
        date: date || '',
        time: time || '',
      },
    };

    // Create and confirm payment intent with Stripe
    let paymentIntent;
    try {
      console.log('Creating payment intent...');
      paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      console.log('Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);
    } catch (stripeError) {
      console.error('Stripe error creating payment intent:', stripeError.message);
      console.error('Error code:', stripeError.code);
      console.error('Error type:', stripeError.type);
      
      return res.status(400).json({
        status: 'error',
        message: stripeError.message || 'Payment processing failed',
        code: stripeError.code || 'PAYMENT_FAILED',
        details: stripeError.raw?.message || ''
      });
    }

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      console.log('✅ Payment succeeded!');
      
      try {
        // Create tour booking after successful payment
        console.log(`📍 Creating tour with buyer ${buyerId}, post ${postId}, agent ${agentId}`);
        const tourResult = await tourService.createTour(buyerId, {
          postId,
          agentId,
          date,
          time
        });

        if (tourResult.status === 'success') {
          console.log(`✅ Tour created successfully! Tour ID: ${tourResult.data.id}`);
          console.log(`📞 Tour calls will be initiated automatically`);
          console.log('=== TOUR BOOK PAYMENT COMPLETED SUCCESSFULLY ===');
          
          return res.status(200).json({ 
            status: 'success',
            message: 'Payment successful and tour booked',
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
            },
            tour: tourResult.data,
          });
        } else {
          console.error(`❌ Failed to create tour: ${tourResult.message}`);
          return res.status(tourResult.code || 400).json({
            status: 'error',
            message: `Payment succeeded but tour creation failed: ${tourResult.message}`,
            code: 'TOUR_CREATION_FAILED',
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
            }
          });
        }
      } catch (tourError) {
        console.error(`❌ Error creating tour after payment:`, tourError.message);
        return res.status(500).json({
          status: 'error',
          message: `Payment succeeded but failed to create tour: ${tourError.message}`,
          code: 'TOUR_CREATION_ERROR',
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
          }
        });
      }
    } else if (paymentIntent.status === 'requires_action') {
      console.log('Payment requires additional action (3D Secure)');
      return res.status(200).json({ 
        status: 'requires_action',
        message: 'Payment requires additional authentication',
        clientSecret: paymentIntent.client_secret,
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
        code: 'PAYMENT_INCOMPLETE',
        paymentIntentStatus: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('=== UNEXPECTED ERROR IN TOUR BOOK PAYMENT ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Create a payment method from card details
 * This should be called from the frontend when the user enters their card
 * 
 * Request body:
 * {
 *   "cardNumber": "4242424242424242",
 *   "expMonth": 12,
 *   "expYear": 2025,
 *   "cvc": "123",
 *   "name": "John Doe"
 * }
 */
export async function createPaymentMethod(req, res) {
  try {
    const { cardNumber, expMonth, expYear, cvc, name } = req.body;

    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing card details: cardNumber, expMonth, expYear, or cvc',
        code: 'MISSING_CARD_DETAILS'
      });
    }

    console.log(`Creating payment method for card ending in ${cardNumber.slice(-4)}...`);

    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
      billing_details: {
        name: name || 'Unknown'
      }
    });

    console.log(`Payment method created: ${paymentMethod.id}`);

    res.status(200).json({
      status: 'success',
      paymentMethodId: paymentMethod.id,
      card: {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      }
    });
  } catch (error) {
    console.error('Error creating payment method:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create payment method',
      code: 'PAYMENT_METHOD_CREATION_FAILED'
    });
  }
}

/**
 * List all payment methods for the current user
 */
export async function listPaymentMethods(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    console.log(`Fetching payment methods for user ${userId}...`);

    // TODO: Query your database to get user's saved payment methods
    // This would typically be a stored list of payment method IDs
    // For now, returning an empty list as a placeholder

    res.status(200).json({
      status: 'success',
      paymentMethods: []
    });
  } catch (error) {
    console.error('Error listing payment methods:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to list payment methods',
      code: 'LIST_PAYMENT_METHODS_FAILED'
    });
  }
}

/**
 * Claim a lead with payment
 * Called by frontend to create a payment intent for lead claim fee
 * 
 * Request body:
 * {
 *   "leadId": 123,
 *   "agentId": 456,
 *   "amount": 2,  // in dollars
 *   "propertyPrice": 350000,
 *   "paymentMethodId": "pm_...",
 *   "billing_details": {
 *     "name": "John Doe"
 *   }
 * }
 */
export async function claimLeadPayment(req, res) {
  try {
    const { leadId, agentId, amount, propertyPrice, paymentMethodId, billing_details } = req.body;
    const amountCents = Math.round(amount * 100);

    // Validate required fields
    if (!leadId || !agentId || !amount || !paymentMethodId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: leadId, agentId, amount, or paymentMethodId',
        code: 'MISSING_FIELDS'
      });
    }

    console.log(`Creating payment intent for lead claim - Lead ID: ${leadId}, Agent ID: ${agentId}, Amount: $${amount}`);

    // Create payment intent with lead claim metadata
    const paymentIntentData = {
      amount: amountCents,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        leadId: leadId?.toString(),
        agentId: agentId?.toString(),
        propertyPrice: propertyPrice?.toString() || '',
        type: 'lead_claim',
      },
      description: `Lead Claim Fee - Lead ID: ${leadId}`,
    };

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
    } catch (stripeError) {
      console.error('Stripe error creating payment intent:', stripeError.message);
      return res.status(400).json({
        status: 'error',
        message: stripeError.message || 'Payment processing failed',
        code: stripeError.code || 'PAYMENT_FAILED',
        details: stripeError.raw?.message || ''
      });
    }

    // Return client secret and payment intent details
    return res.status(200).json({
      status: 'success',
      message: 'Payment intent created for lead claim',
      clientSecret: paymentIntent.client_secret,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      }
    });

  } catch (error) {
    console.error('Error in claimLeadPayment:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
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