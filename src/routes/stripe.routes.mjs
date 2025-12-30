
import { Router } from 'express';
import { createStripeAccountLink } from '../controllers/stripe.controller.mjs';
import { tourBookPayment } from '../controllers/stripe.controller.mjs';

const router = Router();

// Route for agent Stripe Connect onboarding
router.post('/agent/onboard', createStripeAccountLink);
// Route for tour booking payment
router.post('/tour/book', tourBookPayment);
export default router;
