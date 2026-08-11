import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = () => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId: number) => {
    try {
      const res = await api.delete(`/bookings/cancel/${bookingId}`);
      setMessage(`✅ Cancelled! Refund: ₹${res.data.refundAmount} (${res.data.refundPercent}%)`);
      setMessageType('success');
      fetchBookings();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Cancel failed'}`);
      setMessageType('error');
    }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">
        🎟 My Bookings
      </h2>
      <p className="text-gray-400 text-sm mb-6">Manage your booked tickets</p>

      {/* Stats */}
      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl">{bookings.length}</p>
            <p className="text-gray-400 text-xs">Total</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
            <p className="text-green-400 font-bold text-xl">{confirmed}</p>
            <p className="text-gray-400 text-xs">Confirmed</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-3 text-center">
            <p className="text-red-400 font-bold text-xl">{cancelled}</p>
            <p className="text-gray-400 text-xs">Cancelled</p>
          </div>
        </div>
      )}

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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
        </div>
      )}

      {/* Empty */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎫</p>
          <p className="text-gray-400 mb-4">No bookings yet.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition text-sm"
          >
            Browse Events
          </button>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map(b => (
          <div
            key={b.id}
            className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-4 sm:p-6 shadow-xl"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {b.event_name}
              </h3>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                b.status === 'confirmed'
                  ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
                  : 'bg-red-500 bg-opacity-20 text-red-300 border border-red-500'
              }`}>
                {b.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
              <p>📍 {b.venue}</p>
              <p>🪑 Seat: <span className="text-white font-semibold">{b.seat_number}</span></p>
              <p>📅 {new Date(b.event_date).toLocaleDateString()}</p>
              <p>💰 <span className="text-purple-300 font-bold">₹{b.amount_paid}</span></p>
            </div>

            {b.status === 'confirmed' && (
              <button
                onClick={() => handleCancel(b.id)}
                className="mt-2 w-full sm:w-auto bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-6 py-2 rounded-xl hover:bg-opacity-30 transition text-sm font-semibold"
              >
                Cancel Booking
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;