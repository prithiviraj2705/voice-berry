import { Router } from 'express';
import { extractIntent, createBooking, getUserBookings, updateBooking } from '../controllers/bookingController';

const router = Router();

router.post('/extract-intent', extractIntent);

router.post('/', createBooking);

router.get('/:userId', getUserBookings);

router.patch('/:id', updateBooking);

export default router;
