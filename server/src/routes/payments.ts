import { Router } from 'express';
import { createPaymentIntent, confirmPaymentAndSendEmail } from '../controllers/paymentController';

const router = Router();

router.post('/intent', createPaymentIntent);

router.post('/confirm', confirmPaymentAndSendEmail);

export default router;
