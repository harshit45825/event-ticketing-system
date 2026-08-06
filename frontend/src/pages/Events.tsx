import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">🎵 Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded shadow p-4">
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <p className="text-gray-500">📍 {event.venue}</p>
            <p className="text-gray-500">📅 {new Date(event.event_date).toLocaleString()}</p>
            <p className="text-green-600 font-bold mt-2">₹{event.base_price}</p>
            <button
              onClick={() => navigate(`/events/${event.id}/seats`)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              View Seats
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;