import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './PrivateRoute.css'; // Import the CSS file

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="private-route-loading">
        <LoadingSpinner />
        <p className="private-route-text">Checking authentication...</p>
      </div>
    );
  }

  if (user) {
    return <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
