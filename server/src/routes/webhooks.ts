import { Router } from 'express';
import express from 'express';

const router = Router();

// Notice express.raw({ type: 'application/json' }) will be needed for Stripe Webhooks
router.post('/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  res.json({ received: true });
});

router.post('/notifications/register', express.json(), (req, res) => {
  res.json({ success: true, message: 'FCM token registration scaffolded' });
});

export default router;
