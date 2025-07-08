import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api'; // Your Axios instance
import LoadingSpinner from '../components/LoadingSpinner'; // Optional spinner for loading state
import './AuthContext.css'; // Import the CSS file for styling

// Create the Auth Context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user when app starts
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/users/profile');
          setUser(res.data);
        } catch (error) {
          console.error(
            'Failed to load user from token:',
            error.response?.data?.message || error.message
          );
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Register
  const register = async (name, email, password, role = 'student') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Show loading spinner while authenticating
  if (loading) {
    return (
      <div className="auth-loading-container">
        <LoadingSpinner />
        <p className="auth-loading-message">Authenticating...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
