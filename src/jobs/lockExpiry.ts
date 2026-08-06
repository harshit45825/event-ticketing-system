import cron from 'node-cron';
import pool from '../db/pool';

// Runs every minute
cron.schedule('* * * * *', async () => {
  try {
    const result = await pool.query(
      `UPDATE seats SET status = 'available', locked_at = NULL
       WHERE status = 'locked'
       AND locked_at < NOW() - INTERVAL '10 minutes'`
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Released ${result.rowCount} expired seat locks`);
    }
  } catch (err) {
    console.error('Lock expiry job failed:', err);
  }
});