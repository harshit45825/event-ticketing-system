import { Router } from 'express';
import { lockSeat, confirmBooking, getMyBookings } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All booking routes require authentication
router.post('/lock/:seatId', authenticate, lockSeat);
router.post('/confirm', authenticate, confirmBooking);
router.get('/my', authenticate, getMyBookings);

export default router;