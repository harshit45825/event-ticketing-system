import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-black bg-opacity-40 backdrop-blur-md border-b border-white border-opacity-10 px-4 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/events" className="text-xl font-bold text-white">
          🎟 <span className="text-purple-400">Ticket</span>App
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center">
          {token ? (
            <>
              <span className="text-gray-300 text-sm">
                👋 Hi, <span className="text-purple-300 font-semibold">{user?.name}</span>
              </span>
              <Link
                to="/my-bookings"
                className="text-sm text-white bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 transition"
              >
                My Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 bg-opacity-80 px-4 py-2 rounded-full text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-white border border-white border-opacity-30 px-4 py-2 rounded-full hover:bg-white hover:bg-opacity-10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 px-4 pb-4 border-t border-white border-opacity-10 pt-4">
          {token ? (
            <>
              <span className="text-gray-300 text-sm">
                👋 Hi, <span className="text-purple-300 font-semibold">{user?.name}</span>
              </span>
              <Link
                to="/my-bookings"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-white bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700 transition text-center"
              >
                My Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-500 bg-opacity-80 px-4 py-2 rounded-full text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-white border border-white border-opacity-30 px-4 py-2 rounded-full hover:bg-white hover:bg-opacity-10 transition text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition text-center"
              >
                Register
              </Link>
              <Link
  to="/dashboard"
  className="text-sm text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition"
>
  📊 Dashboard
</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;