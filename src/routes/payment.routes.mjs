import { Router } from 'express';
import { payForTour } from '../controllers/payment.controller.mjs';

const router = Router();

// Route for buyer to pay for tour
router.post('/tour', payForTour);

export default router;
