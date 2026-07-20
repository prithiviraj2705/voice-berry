import { Router } from 'express';
import { getUserAddresses, addAddress, deleteAddress } from '../controllers/addressController';

const router = Router();

router.get('/:userId', getUserAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;
