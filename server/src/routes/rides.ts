import { Router } from 'express';

const router = Router();

router.get('/:bookingId', (req, res) => {
  res.json({ message: 'Get ride route scaffolded' });
});

router.patch('/:id/status', (req, res) => {
  res.json({ message: 'Update ride status route scaffolded' });
});

export default router;
