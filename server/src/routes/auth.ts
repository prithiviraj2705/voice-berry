import { Router } from 'express';

const router = Router();

router.post('/profile', (req, res) => {
  res.json({ message: 'Profile upsert route scaffolded' });
});

export default router;
