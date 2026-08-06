import { useEffect, useState } from 'react';
import api from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const fetchBookings = () => {
    api.get('/bookings/my').then(res => setBookings(res.data));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId: number) => {
    try {
      const res = await api.delete(`/bookings/cancel/${bookingId}`);
      setMessage(`✅ Cancelled! Refund: ₹${res.data.refundAmount}`);
      fetchBookings();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Cancel failed'}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">🎟 My Bookings</h2>
      {message && <p className="mb-4 text-lg">{message}</p>}
      {bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
      {bookings.map(b => (
        <div key={b.id} className="bg-white rounded shadow p-4 mb-4">
          <h3 className="text-xl font-semibold">{b.event_name}</h3>
          <p className="text-gray-500">📍 {b.venue}</p>
          <p className="text-gray-500">🪑 Seat: {b.seat_number}</p>
          <p className="text-gray-500">📅 {new Date(b.event_date).toLocaleString()}</p>
          <p className="text-green-600 font-bold">₹{b.amount_paid}</p>
          <span className={`text-sm px-2 py-1 rounded ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {b.status}
          </span>
          {b.status === 'confirmed' && (
            <button
              onClick={() => handleCancel(b.id)}
              className="mt-3 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyBookings;