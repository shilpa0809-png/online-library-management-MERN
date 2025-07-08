import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
import './LibrarianDashboard.css'; // Import the styles

const LibrarianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingBorrowings, setLoadingBorrowings] = useState(true);
  const [booksError, setBooksError] = useState(null);
  const [borrowingsError, setBorrowingsError] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (user.role !== 'librarian' && user.role !== 'admin')) {
      navigate('/dashboard');
    } else if (user && (user.role === 'librarian' || user.role === 'admin')) {
      fetchAllBooks();
      fetchAllBorrowings();
    }
  }, [user, navigate]);

  const fetchAllBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await api.get('/books');
      setBooks(res.data.data);
      setBooksError(null);
    } catch (err) {
      console.error('Error fetching all books for librarian:', err);
      setBooksError('Failed to load all books.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchAllBorrowings = async () => {
    setLoadingBorrowings(true);
    try {
      const res = await api.get('/borrowings');
      setBorrowings(res.data);
      setBorrowingsError(null);
    } catch (err) {
      console.error('Error fetching all borrowings for librarian:', err);
      setBorrowingsError('Failed to load all borrowing records.');
    } finally {
      setLoadingBorrowings(false);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (window.confirm(`Are you sure you want to delete book "${bookTitle}"? This action cannot be undone.`)) {
      setMessage('');
      setError('');
      try {
        await api.delete(`/books/${bookId}`);
        setMessage(`Book "${bookTitle}" deleted successfully!`);
        fetchAllBooks();
      } catch (err) {
        console.error('Error deleting book:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to delete book.');
      }
    }
  };

  const handleReturnBookAsLibrarian = async (borrowingId, bookTitle) => {
    if (window.confirm(`Are you sure you want to mark "${bookTitle}" as returned?`)) {
      setMessage('');
      setError('');
      try {
        await api.put(`/borrowings/return/${borrowingId}`);
        setMessage(`Book "${bookTitle}" marked as returned successfully!`);
        fetchAllBorrowings();
      } catch (err) {
        console.error('Error returning book as librarian:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to return book.');
      }
    }
  };

  if (!user || (user && user.role !== 'librarian' && user.role !== 'admin')) {
    return (
      <div className="center-container">
        <LoadingSpinner />
        <p className="loading-text">Loading user data or unauthorized...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Librarian Dashboard</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="card">
        <h3 className="section-title">Book Management</h3>
        <Link to="/add-book" className="add-book-btn">Add New Book</Link>
        {loadingBooks ? (
          <LoadingSpinner />
        ) : booksError ? (
          <p className="error-message">{booksError}</p>
        ) : books.length === 0 ? (
          <p className="muted-text">No books found. Add some!</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th><th>Author</th><th>ISBN</th><th>Qty</th><th>Available</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.quantity}</td>
                    <td>{book.availableCopies}</td>
                    <td>
                      <Link to={`/edit-book/${book._id}`} className="edit-btn">Edit</Link>
                      <button onClick={() => handleDeleteBook(book._id, book.title)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="section-title">All Borrowing Records</h3>
        {loadingBorrowings ? (
          <LoadingSpinner />
        ) : borrowingsError ? (
          <p className="error-message">{borrowingsError}</p>
        ) : borrowings.length === 0 ? (
          <p className="muted-text">No borrowing records found.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th><th>Book</th><th>Borrowed On</th><th>Due Date</th><th>Status</th><th>Fine</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowings.map((b) => (
                  <tr key={b._id}>
                    <td>{b.user ? b.user.name : 'N/A'}</td>
                    <td>{b.book ? b.book.title : 'N/A'}</td>
                    <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(b.returnDate).toLocaleDateString()}</td>
                    <td>{b.status}</td>
                    <td>${b.fineAmount ? b.fineAmount.toFixed(2) : '0.00'}</td>
                    <td>
                      {b.status !== 'returned' && (
                        <button onClick={() => handleReturnBookAsLibrarian(b._id, b.book ? b.book.title : 'Unknown')} className="return-btn">Return</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarianDashboard;
