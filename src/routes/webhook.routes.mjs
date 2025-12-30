import { Router } from 'express';
import { stripeWebhook, handleStripeWebhook } from '../controllers/webhook.controller.mjs';

const router = Router();

// Stripe webhook endpoint
router.post('/stripe', stripeWebhook, handleStripeWebhook);

export default router;
