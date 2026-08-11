import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Join us to book amazing events</p>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-gray-400 p-3 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center mt-4 text-sm text-gray-400">
          Have account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;