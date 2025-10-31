import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import { getCart } from './services/api';

// Import your pages (create these files)
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import LibraryPage from './pages/LibraryPage';

// Create Auth Context
export const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true; // Enable cookies for session management

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('auth/me/');
      setUser(response.data);
      // Load cart after user is authenticated
      await loadCart();
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const cartItems = await getCart();
      setCart(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('auth/login/', { username, password });
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      setUser(response.data);
      // Load cart after login
      await loadCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('auth/register/', userData);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      setUser(response.data);
      // Load cart after registration
      await loadCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setCart([]);
    }
  };

  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#1b2838',
      color: '#fff'
    }}>Loading...</div>;
  }

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ user, login, register, logout, cart, setCart }}>
        <Router>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:slug" element={<GamePage />} />
          <Route path="/profile" element={
            user ? <ProfilePage /> : <Navigate to="/login" />
          } />
          <Route path="/wishlist" element={
            user ? <WishlistPage /> : <Navigate to="/login" />
          } />
          <Route path="/library" element={
            user ? <LibraryPage /> : <Navigate to="/login" />
          } />
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <LoginPage />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/" /> : <RegisterPage />
          } />
          <Route path="/checkout" element={
            user ? <CheckoutPage /> : <Navigate to="/login" />
          } />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}

export default App;