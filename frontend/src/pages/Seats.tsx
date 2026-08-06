import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const Seats = () => {
  const { eventId } = useParams();
  const [seats, setSeats] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const fetchSeats = () => {
    api.get(`/events/${eventId}/seats`).then(res => setSeats(res.data));
  };

  useEffect(() => { fetchSeats(); }, []);

  const handleLock = async (seatId: number) => {
    try {
      await api.post(`/bookings/lock/${seatId}`);
      const res = await api.post('/bookings/confirm', { seatId, eventId: Number(eventId) });
      setMessage(`✅ Booked! Paid ₹${res.data.amountPaid}`);
      fetchSeats();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Booking failed'}`);
    }
  };

  const getColor = (status: string, category: string) => {
    if (status === 'booked') return 'bg-red-400 cursor-not-allowed';
    if (status === 'locked') return 'bg-yellow-400 cursor-not-allowed';
    if (category === 'vip') return 'bg-purple-400 hover:bg-purple-500 cursor-pointer';
    return 'bg-green-400 hover:bg-green-500 cursor-pointer';
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2">🪑 Select a Seat</h2>
      {message && <p className="mb-4 text-lg">{message}</p>}

      <div className="flex gap-3 mb-6 text-sm">
        <span className="bg-green-400 px-3 py-1 rounded">General</span>
        <span className="bg-purple-400 px-3 py-1 rounded">VIP</span>
        <span className="bg-yellow-400 px-3 py-1 rounded">Locked</span>
        <span className="bg-red-400 px-3 py-1 rounded">Booked</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {seats.map(seat => (
          <button
            key={seat.id}
            disabled={seat.status !== 'available'}
            onClick={() => handleLock(seat.id)}
            className={`p-3 rounded text-white text-sm font-bold ${getColor(seat.status, seat.category)}`}
          >
            {seat.seat_number}
            <br />
            <span className="text-xs">{seat.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Seats;