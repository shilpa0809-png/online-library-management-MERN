import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">My Library</Link>
        <div className="navbar-links">
          <Link to="/books" className="navbar-link">Books</Link>
          <Link to="/contact" className="navbar-link">Contact</Link> 
          {!user ? (
            <Link to="/login" className="navbar-link">Login</Link>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="navbar-link">Admin Panel</Link>
              )}
              {user.role === 'librarian' && (
                <Link to="/librarian" className="navbar-link">Librarian Panel</Link>
              )}
              <button onClick={logout} className="navbar-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
