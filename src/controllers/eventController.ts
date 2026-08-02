import { Request, Response } from 'express';
import pool from '../db/pool';

// Create an event (admin use)
export const createEvent = async (req: Request, res: Response) => {
  const { name, venue, event_date, total_seats, base_price } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO events (name, venue, event_date, total_seats, base_price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, venue, event_date, total_seats, base_price]
    );

    const event = result.rows[0];

    // Auto-generate seats for this event
    const seatInserts = [];
    for (let i = 1; i <= total_seats; i++) {
      const category = i <= Math.floor(total_seats * 0.2) ? 'vip' : 'general';
      seatInserts.push(
        pool.query(
          `INSERT INTO seats (event_id, seat_number, category) VALUES ($1, $2, $3)`,
          [event.id, `S${i}`, category]
        )
      );
    }
    await Promise.all(seatInserts);

    res.status(201).json({ event, message: `${total_seats} seats created` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Get all events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events ORDER BY event_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get seats for an event
export const getSeats = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, seat_number, category, status 
       FROM seats WHERE event_id = $1 ORDER BY id ASC`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
};