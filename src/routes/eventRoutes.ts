import { Router } from 'express';
import { createEvent, getEvents, getSeats } from '../controllers/eventController';

const router = Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.get('/:eventId/seats', getSeats);

export default router;