import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Seats from './pages/Seats';
import MyBookings from './pages/MyBookings';
import type { JSX } from 'react/jsx-runtime';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/events/:eventId/seats" element={<PrivateRoute><Seats /></PrivateRoute>} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/events" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;