# 🎟 Event Ticketing & Seat Allocation System

A full-stack event ticketing platform with AI-powered insights, dynamic pricing, and race-condition-free seat booking.

🌐 **Live Demo:** [event-ticketing-system-inky.vercel.app](https://event-ticketing-system-inky.vercel.app)
⚙️ **Backend API:** [ticketapp-backend-dbkd.onrender.com](https://ticketapp-backend-dbkd.onrender.com)

---

## ✨ Features

- 🔐 **JWT Authentication** — Register and login with secure tokens
- 🪑 **Seat Locking** — PostgreSQL `SELECT FOR UPDATE` prevents double bookings
- 💸 **Dynamic Pricing** — Prices increase as seats fill up
- 📱 **QR Code Tickets** — Auto-generated on booking confirmation
- 💰 **Smart Refunds** — Tiered cancellation refunds based on time
- 🤖 **AI Dashboard** — Claude AI analyzes booking patterns
- 🎨 **Interactive Landing** — Particle animations, 5 themes, ripple effects
- 📊 **Analytics** — Charts for bookings, seats, and spending

---

## 🛠 Tech Stack

### Backend
| Technology | Usage |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| PostgreSQL | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| QRCode | Ticket generation |
| node-cron | Lock expiry jobs |

### Frontend
| Technology | Usage |
|---|---|
| React + Vite | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Axios | API calls |
| Recharts | Data visualization |
| React Router | Navigation |

### Infrastructure
| Service | Usage |
|---|---|
| Render | Backend hosting |
| Vercel | Frontend hosting |
| Neon | Cloud PostgreSQL |
| GitHub | Version control |

---

## 🏗 Architecture
Frontend (Vercel) Backend (Render) Database (Neon)
React + TypeScript → Node.js + Express → PostgreSQL
5173 3000

---

## 🔒 How Seat Locking Works

The core challenge is preventing two users from booking the same seat simultaneously.

```sql
BEGIN;

-- Lock the row so no other transaction can touch it
SELECT * FROM seats 
WHERE id = $1 AND status = 'available' 
FOR UPDATE;

-- Update status
UPDATE seats SET status = 'locked', locked_at = NOW() 
WHERE id = $1;

COMMIT;
```

If two users try to book the same seat:
- User A locks the row → User B waits
- User A completes → User B sees seat is taken
- **Zero double bookings guaranteed**

---

## 💸 Dynamic Pricing Logic

```typescript
const calculatePrice = (base: number, available: number, total: number) => {
  const fillRatio = 1 - available / total;
  if (fillRatio > 0.8) return base * 1.5;  // 80%+ full → 1.5x price
  if (fillRatio > 0.5) return base * 1.2;  // 50%+ full → 1.2x price
  return base;                               // normal price
};
```

---

## 💰 Refund Policy

| Time Before Event | Refund |
|---|---|
| More than 48 hours | 100% |
| 24 to 48 hours | 50% |
| Less than 24 hours | 0% |

---

## 🗄 Database Schema

```sql
users       — id, name, email, password_hash
events      — id, name, venue, event_date, total_seats, base_price
seats       — id, event_id, seat_number, category, status, locked_at
bookings    — id, user_id, event_id, seat_id, amount_paid, qr_code, status
```

---

## 🚀 API Endpoints

### Auth
POST /api/auth/register — Create account
POST /api/auth/login — Login and get token

### Events

GET /api/events — List all events
POST /api/events — Create event
GET /api/events/:id/seats — Get seats for event

### Bookings

POST /api/bookings/lock/:seatId — Lock a seat
POST /api/bookings/confirm — Confirm booking
GET /api/bookings/my — Get my bookings
DELETE /api/bookings/cancel/:id — Cancel booking

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm

### Backend Setup
```bash
# Clone repo
git clone https://github.com/harshit45825/event-ticketing-system.git
cd event-ticketing-system

# Install dependencies
npm install

# Create .env file
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing
JWT_SECRET=your_secret_key
PORT=3000

# Create database
psql -U postgres -c "CREATE DATABASE ticketing;"
psql -U postgres -d ticketing -f src/db/schema.sql

# Run dev server
npm run dev
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
VITE_API_URL=http://localhost:3000/api

# Run dev server
npm run dev
```

---

## 📁 Project Structure
event-ticketing-system/
├── src/
│ ├── controllers/
│ │ ├── authController.ts
│ │ ├── eventController.ts
│ │ └── bookingController.ts
│ ├── routes/
│ │ ├── authRoutes.ts
│ │ ├── eventRoutes.ts
│ │ └── bookingRoutes.ts
│ ├── middleware/
│ │ └── auth.ts
│ ├── db/
│ │ ├── pool.ts
│ │ └── schema.sql
│ ├── jobs/
│ │ └── lockExpiry.ts
│ └── index.ts
├── frontend/
│ └── src/
│ ├── pages/
│ │ ├── Landing.tsx
│ │ ├── Login.tsx
│ │ ├── Register.tsx
│ │ ├── Events.tsx
│ │ ├── Seats.tsx
│ │ ├── MyBookings.tsx
│ │ └── Dashboard.tsx
│ ├── components/
│ │ └── Navbar.tsx
│ ├── context/
│ │ └── AuthContext.tsx
│ └── api/
│ └── axios.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md

---

## 🎯 Key Technical Decisions

**Why PostgreSQL over MongoDB?**
Transactional integrity is critical for seat booking. PostgreSQL's ACID compliance and row-level locking make it the right choice.

**Why JWT over Sessions?**
Stateless authentication works better with a separate frontend and backend deployment.

**Why node-cron for lock expiry?**
Simple and reliable for running periodic cleanup jobs without external dependencies.

---

## 👨‍💻 Author

**Harshit** — [github.com/harshit45825](https://github.com/harshit45825)

---

## 📄 License

MIT