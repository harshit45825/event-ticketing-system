import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Seats from './pages/Seats';
import MyBookings from './pages/MyBookings';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const AppLayout = () => {
  const location = useLocation();
  const hiddenNavRoutes = ['/'];

  return (
    <>
      {!hiddenNavRoutes.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
        <Route path="/events/:eventId/seats" element={<PrivateRoute><Seats /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;