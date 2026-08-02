import express from 'express';
import dotenv from 'dotenv';
import pool from './db/pool';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Server is running!', dbTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});