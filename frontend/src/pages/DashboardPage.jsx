// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [isBorrowedBooksLoading, setIsBorrowedBooksLoading] = useState(true);
  const [borrowedBooksError, setBorrowedBooksError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchBorrowedBooks();
    }
  }, [user]);

  const fetchBorrowedBooks = async () => {
    setIsBorrowedBooksLoading(true);
    try {
      const res = await api.get('/borrowings/my-borrowings');
      setBorrowedBooks(res.data);
      setBorrowedBooksError(null);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setBorrowedBooksError('Failed to load borrowed books.');
    } finally {
      setIsBorrowedBooksLoading(false);
    }
  };

  const handleReturnBook = async (borrowingId) => {
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/borrowings/return/${borrowingId}`);
      setMessage(`Book "${res.data.book.title}" returned successfully!`);
      fetchBorrowedBooks();
    } catch (err) {
      console.error('Error returning book:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to return book.');
    }
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome, {user.name}!</h2>

      <div className="dashboard-section">
        <h3>Your Profile</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
      </div>

      {user.role === 'student' && (
        <div className="dashboard-section">
          <h3>Your Borrowed Books</h3>
          {isBorrowedBooksLoading ? (
            <LoadingSpinner />
          ) : borrowedBooksError ? (
            <p className="error-text">{borrowedBooksError}</p>
          ) : borrowedBooks.length === 0 ? (
            <p>
              You have no active borrowed books.
              <Link to="/books" className="dashboard-link"> Browse books!</Link>
            </p>
          ) : (
            <div className="borrowed-books-list">
              {borrowedBooks.map((borrowing) => (
                <div key={borrowing._id} className="borrowed-book-card">
                  <Link to={`/books/${borrowing.book._id}`}>
                    <img
                      src={borrowing.book.coverImage || 'https://placehold.co/80x100/cccccc/333333?text=Book'}
                      alt={borrowing.book.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x100/cccccc/333333?text=Book'; }}
                    />
                  </Link>
                  <div className="borrowed-book-details">
                    <Link to={`/books/${borrowing.book._id}`}>
                      {borrowing.book.title}
                    </Link>
                    <p>by {borrowing.book.author}</p>
                    <p>Borrowed: {new Date(borrowing.borrowDate).toLocaleDateString()}</p>
                    <p>Due: {new Date(borrowing.returnDate).toLocaleDateString()}</p>
                    {borrowing.fineAmount > 0 && (
                      <p className="fine-text">Fine: ${borrowing.fineAmount.toFixed(2)}</p>
                    )}
                  </div>
                  <button
                    className="return-button"
                    onClick={() => handleReturnBook(borrowing._id)}
                  >
                    Return
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(user.role === 'librarian' || user.role === 'admin') && (
        <div className="dashboard-section">
          <h3>Librarian/Admin Tools</h3>
          <Link to="/add-book" className="dashboard-btn green">Add New Book</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="dashboard-btn purple">Admin Panel</Link>
          )}
          {user.role === 'librarian' && (
            <Link to="/librarian" className="dashboard-btn orange">Librarian Panel</Link>
          )}
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
