import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/events" className="text-xl font-bold text-blue-400">
        🎟 TicketApp
      </Link>
      <div className="flex gap-4 items-center">
        {token ? (
          <>
            <span className="text-gray-300">Hi, {user?.name}</span>
            <Link to="/my-bookings" className="hover:text-blue-400">My Bookings</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">Login</Link>
            <Link to="/register" className="hover:text-blue-400">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;