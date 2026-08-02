import { Request, Response } from 'express';
import pool from '../db/pool';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { AuthRequest } from '../middleware/auth';

// Dynamic pricing
const calculatePrice = (basePrice: number, available: number, total: number): number => {
  const fillRatio = 1 - available / total;
  if (fillRatio > 0.8) return basePrice * 1.5;
  if (fillRatio > 0.5) return basePrice * 1.2;
  return basePrice;
};

// Lock a seat (hold for 10 minutes)
export const lockSeat = async (req: AuthRequest, res: Response) => {
  const { seatId } = req.params;
  const userId = req.userId;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Lock the row so no other request can touch it
    const seatResult = await client.query(
      `SELECT * FROM seats WHERE id = $1 AND status = 'available' FOR UPDATE`,
      [seatId]
    );

    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'Seat not available' });
      return;
    }

    // Lock the seat for 10 minutes
    await client.query(
      `UPDATE seats SET status = 'locked', locked_at = NOW() WHERE id = $1`,
      [seatId]
    );

    await client.query('COMMIT');

    res.json({ 
      message: 'Seat locked for 10 minutes', 
      seatId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to lock seat' });
  } finally {
    client.release();
  }
};

// Confirm booking after payment
export const confirmBooking = async (req: AuthRequest, res: Response) => {
  const { seatId, eventId } = req.body;
  const userId = req.userId;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check seat is still locked
    const seatResult = await client.query(
      `SELECT * FROM seats WHERE id = $1 AND status = 'locked' FOR UPDATE`,
      [seatId]
    );

    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'Seat lock expired or not locked' });
      return;
    }

    // Get event for pricing
    const eventResult = await client.query(
      `SELECT * FROM events WHERE id = $1`, [eventId]
    );
    const event = eventResult.rows[0];

    // Count available seats for dynamic pricing
    const availableResult = await client.query(
      `SELECT COUNT(*) FROM seats WHERE event_id = $1 AND status = 'available'`,
      [eventId]
    );
    const available = parseInt(availableResult.rows[0].count);
    const price = calculatePrice(event.base_price, available, event.total_seats);

    // Generate QR code
    const token = uuidv4();
    const qrData = JSON.stringify({ token, seatId, eventId, userId });
    const qrCode = await QRCode.toDataURL(qrData);

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, event_id, seat_id, amount_paid, qr_code, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed') RETURNING *`,
      [userId, eventId, seatId, price, token]
    );

    // Mark seat as booked
    await client.query(
      `UPDATE seats SET status = 'booked' WHERE id = $1`,
      [seatId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      booking: bookingResult.rows[0],
      qrCode,
      amountPaid: price
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Booking failed' });
  } finally {
    client.release();
  }
};

// Get user's bookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT b.*, e.name as event_name, e.venue, e.event_date, s.seat_number
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN seats s ON b.seat_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};