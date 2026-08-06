import { Router } from 'express';
import { 
  lockSeat, 
  confirmBooking, 
  getMyBookings,
  cancelBooking 
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/lock/:seatId', authenticate, lockSeat);
router.post('/confirm', authenticate, confirmBooking);
router.get('/my', authenticate, getMyBookings);
router.delete('/cancel/:bookingId', authenticate, cancelBooking);

export default router;