CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  venue VARCHAR(200),
  event_date TIMESTAMP NOT NULL,
  total_seats INT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id),
  seat_number VARCHAR(10) NOT NULL,
  category VARCHAR(20) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'available',
  locked_at TIMESTAMP
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  event_id INT REFERENCES events(id),
  seat_id INT REFERENCES seats(id),
  amount_paid NUMERIC(10,2),
  qr_code TEXT,
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_seats_event_status ON seats(event_id, status);
CREATE INDEX idx_bookings_user ON bookings(user_id);