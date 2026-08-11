import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Seats = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<number | null>(null);

  const fetchSeats = () => {
    api.get(`/events/${eventId}/seats`).then(res => setSeats(res.data));
  };

  useEffect(() => { fetchSeats(); }, []);

  const handleLock = async (seatId: number) => {
    setBookingLoading(seatId);
    setLoading(true);
    try {
      await api.post(`/bookings/lock/${seatId}`);
      const res = await api.post('/bookings/confirm', {
        seatId,
        eventId: Number(eventId)
      });
      setMessage(`✅ Seat booked! You paid ₹${res.data.amountPaid}`);
      setMessageType('success');
      fetchSeats();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Booking failed'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
      setBookingLoading(null);
    }
  };

  const getStyle = (status: string, category: string) => {
    if (status === 'booked') return 'bg-red-500 bg-opacity-60 cursor-not-allowed opacity-60';
    if (status === 'locked') return 'bg-yellow-500 bg-opacity-60 cursor-not-allowed opacity-60';
    if (category === 'vip') return 'bg-purple-500 hover:bg-purple-600 cursor-pointer hover:scale-110 active:scale-95';
    return 'bg-green-500 hover:bg-green-600 cursor-pointer hover:scale-110 active:scale-95';
  };

  const available = seats.filter(s => s.status === 'available').length;
  const booked = seats.filter(s => s.status === 'booked').length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/events')}
          className="text-gray-400 hover:text-white transition text-sm"
        >
          ← Back
        </button>
      </div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">
        🪑 Select Your Seat
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Click an available seat to book instantly
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
          <p className="text-green-400 font-bold text-xl">{available}</p>
          <p className="text-gray-400 text-xs">Available</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
          <p className="text-red-400 font-bold text-xl">{booked}</p>
          <p className="text-gray-400 text-xs">Booked</p>
        </div>
        <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
          <p className="text-white font-bold text-xl">{seats.length}</p>
          <p className="text-gray-400 text-xs">Total</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold ${
          messageType === 'success'
            ? 'bg-green-500 bg-opacity-20 border border-green-500 text-green-300'
            : 'bg-red-500 bg-opacity-20 border border-red-500 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <span className="bg-green-500 bg-opacity-70 px-3 py-1 rounded-full text-white">🟢 General</span>
        <span className="bg-purple-500 bg-opacity-70 px-3 py-1 rounded-full text-white">🟣 VIP</span>
        <span className="bg-yellow-500 bg-opacity-70 px-3 py-1 rounded-full text-white">🟡 Locked</span>
        <span className="bg-red-500 bg-opacity-70 px-3 py-1 rounded-full text-white">🔴 Booked</span>
      </div>

      {/* Stage */}
      <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl text-center text-gray-300 py-3 mb-6 text-sm tracking-widest">
        🎭 STAGE
      </div>

      {/* Seats Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
        {seats.map(seat => (
          <button
            key={seat.id}
            disabled={seat.status !== 'available' || loading}
            onClick={() => handleLock(seat.id)}
            className={`p-2 sm:p-3 rounded-xl text-white text-xs font-bold transition-all ${getStyle(seat.status, seat.category)}`}
          >
            {bookingLoading === seat.id ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                {seat.seat_number}
                <br />
                <span className="text-xs opacity-80">{seat.category}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Seats;