import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3">
          🎵 Upcoming Events
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Book your seats before they sell out!
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
        </div>
      )}

      {/* No events */}
      {!loading && events.length === 0 && (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🎭</p>
          <p className="text-gray-400">No events available right now.</p>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {events.map(event => (
          <div
            key={event.id}
            className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-5 sm:p-6 hover:scale-105 transition-transform shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl sm:text-5xl mb-3">🎤</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                {event.name}
              </h3>
              <p className="text-gray-400 text-sm mb-1">📍 {event.venue}</p>
              <p className="text-gray-400 text-sm mb-3">
                📅 {new Date(event.event_date).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-purple-300 font-bold text-lg">
                ₹{event.base_price}
              </span>
              <button
                onClick={() => navigate(`/events/${event.id}/seats`)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                View Seats →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;