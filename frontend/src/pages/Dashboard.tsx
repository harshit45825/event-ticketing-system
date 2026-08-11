import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, eventsRes] = await Promise.all([
          api.get('/bookings/my'),
          api.get('/events'),
        ]);
        setBookings(bookingsRes.data);
        setEvents(eventsRes.data);

        // fetch seats for first event
        if (eventsRes.data.length > 0) {
          const seatsRes = await api.get(`/events/${eventsRes.data[0].id}/seats`);
          setSeats(seatsRes.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAiInsight = async () => {
    setAiLoading(true);
    setAiInsight('');

    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalSpent = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.amount_paid), 0);
    const availableSeats = seats.filter(s => s.status === 'available').length;
    const bookedSeats = seats.filter(s => s.status === 'booked').length;

    const prompt = `You are a smart ticketing assistant. Analyze this user's booking data and give personalized insights in 4-5 sentences:

- Total bookings: ${bookings.length}
- Confirmed: ${confirmed}
- Cancelled: ${cancelled}
- Total spent: ₹${totalSpent}
- Available events: ${events.length}
- Seats available in first event: ${availableSeats}
- Seats booked in first event: ${bookedSeats}

Give helpful insights about their booking behavior, spending patterns, and recommendations. Be friendly and conversational.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      setAiInsight(data.content[0].text);
    } catch {
      setAiInsight('Failed to get AI insights. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Chart data
  const bookingStatusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const seatStatusData = [
    { name: 'Available', value: seats.filter(s => s.status === 'available').length },
    { name: 'Booked', value: seats.filter(s => s.status === 'booked').length },
    { name: 'Locked', value: seats.filter(s => s.status === 'locked').length },
  ];

  const spendingData = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => ({
      name: b.event_name?.substring(0, 10) + '...',
      amount: Number(b.amount_paid)
    }));

  const totalSpent = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + Number(b.amount_paid), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">
          📊 Dashboard
        </h2>
        <p className="text-gray-400 text-sm">Your booking analytics and AI insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: '🎟', color: 'text-purple-400' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: '✅', color: 'text-green-400' },
          { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: '❌', color: 'text-red-400' },
          { label: 'Total Spent', value: `₹${totalSpent}`, icon: '💰', color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-4 text-center">
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">

        {/* Booking Status Pie */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-4 sm:p-6">
          <h3 className="text-white font-bold text-lg mb-4">📈 Booking Status</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No bookings yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {bookingStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f1f2e', border: 'none', borderRadius: '8px', color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Seat Status Pie */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-4 sm:p-6">
          <h3 className="text-white font-bold text-lg mb-4">🪑 Seat Status (Event 1)</h3>
          {seats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No events created yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={seatStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {seatStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f1f2e', border: 'none', borderRadius: '8px', color: 'white' }}
                />
                <Legend wrapperStyle={{ color: 'white', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Spending Bar Chart */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-4 sm:p-6 md:col-span-2">
          <h3 className="text-white font-bold text-lg mb-4">💸 Spending Per Event</h3>
          {spendingData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No spending data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendingData}>
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1f1f2e', border: 'none', borderRadius: '8px', color: 'white' }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-purple-500 border-opacity-50 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-white font-bold text-lg">🤖 AI Insights</h3>
            <p className="text-gray-400 text-xs">Powered by Claude AI</p>
          </div>
          <button
            onClick={getAiInsight}
            disabled={aiLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? (
              <>
                <span className="animate-spin">⟳</span> Analyzing...
              </>
            ) : (
              '✨ Get AI Insights'
            )}
          </button>
        </div>

        {!aiInsight && !aiLoading && (
          <div className="text-center py-8">
            <p className="text-5xl mb-3">🧠</p>
            <p className="text-gray-400 text-sm">
              Click "Get AI Insights" to analyze your booking patterns
            </p>
          </div>
        )}

        {aiLoading && (
          <div className="text-center py-8">
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-3 bg-purple-500 bg-opacity-30 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-purple-500 bg-opacity-30 rounded w-full mx-auto"></div>
              <div className="h-3 bg-purple-500 bg-opacity-30 rounded w-2/3 mx-auto"></div>
              <div className="h-3 bg-purple-500 bg-opacity-30 rounded w-5/6 mx-auto"></div>
            </div>
          </div>
        )}

        {aiInsight && (
          <div className="bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded-xl p-4">
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {aiInsight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;