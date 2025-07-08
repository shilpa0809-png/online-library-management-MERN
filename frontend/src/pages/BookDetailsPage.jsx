import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import './BookDetailsPage.css'; // ✅ Add your CSS file

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [borrowingMessage, setBorrowingMessage] = useState('');
  const [borrowingError, setBorrowingError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/books/${id}`);
        const fetchedBook = response.data.data;
        if (!fetchedBook.coverImage || fetchedBook.coverImage.trim() === '') {
          fetchedBook.coverImage = 'https://placehold.co/200x280/cccccc/333333?text=No+Cover';
        }
        setBook(fetchedBook);
        setError(null);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Book might not exist or network error.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleBorrow = () => {
    if (!user) {
      setBorrowingError('Please log in to borrow a book.');
      return;
    }
    if (book.availableCopies <= 0) {
      setBorrowingError('No copies available for borrowing.');
      return;
    }

    const defaultReturnDate = new Date();
    defaultReturnDate.setDate(defaultReturnDate.getDate() + 14);
    setReturnDate(defaultReturnDate.toISOString().split('T')[0]);

    setIsConfirmModalOpen(true);
  };

  const confirmBorrow = async () => {
    setIsConfirmModalOpen(false);
    setBorrowingMessage('');
    setBorrowingError('');

    try {
      const res = await api.post('/borrowings', {
        bookId: book._id,
        returnDate: new Date(returnDate).toISOString(),
      });
      setBorrowingMessage('Book borrowed successfully!');
      setBook(prevBook => ({
        ...prevBook,
        availableCopies: prevBook.availableCopies - 1,
      }));
    } catch (err) {
      console.error('Borrowing failed:', err.response?.data?.message || err.message);
      setBorrowingError(err.response?.data?.message || 'Failed to borrow book.');
    }
  };

  if (loading) {
    return (
      <div className="book-page-container">
        <LoadingSpinner />
        <p className="loading-text">Loading book details...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="book-page-container">
        <p className="error-text">{error}</p>
        <button onClick={() => navigate('/books')} className="back-button">
          Back to Books
        </button>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="book-page-container">
      <div className="book-details-card">
        <div className="book-cover">
          <img
            src={book.coverImage}
            alt={book.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/200x280/cccccc/333333?text=No+Cover';
            }}
          />
        </div>

        <div className="book-info">
          <h1>{book.title}</h1>
          <h2>by {book.author} ({book.publicationYear})</h2>
          <p>{book.description || 'No description available for this book.'}</p>

          <div className="book-meta">
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Genre:</strong> {book.genre}</p>
            <p><strong>Total Copies:</strong> {book.quantity}</p>
            <p><strong>Available Copies:</strong> {book.availableCopies}</p>
            <p><strong>Digital Resource:</strong> {book.isDigital ? 'Yes' : 'No'}</p>
            {book.isDigital && (
              <p><strong>Digital Link:</strong> <a href={book.digitalLink} target="_blank" rel="noreferrer">Access Here</a></p>
            )}
          </div>

          {borrowingMessage && <p className="success-text">{borrowingMessage}</p>}
          {borrowingError && <p className="error-text">{borrowingError}</p>}

          {user && user.role === 'student' && !book.isDigital && (
            <button
              onClick={handleBorrow}
              disabled={book.availableCopies <= 0}
              className={`borrow-button ${book.availableCopies <= 0 ? 'disabled' : ''}`}
            >
              {book.availableCopies > 0 ? 'Borrow This Book' : 'Not Available for Borrowing'}
            </button>
          )}

          {user && user.role === 'student' && book.isDigital && (
            <a href={book.digitalLink} target="_blank" rel="noreferrer" className="access-button">
              Access Digital Book
            </a>
          )}

          {!user && (
            <p>Please <Link to="/login">log in</Link> to borrow or access this book.</p>
          )}

          {/* ✅ Back Button */}
          <button onClick={() => navigate('/books')} className="back-button">
            ← Back to Books
          </button>
        </div>
      </div>

      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <h3>Confirm Borrowing</h3>
        <p>You are about to borrow "<strong>{book?.title}</strong>".</p>
        <label>Expected Return Date:</label>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <div className="modal-actions">
          <button onClick={() => setIsConfirmModalOpen(false)} className="cancel-button">Cancel</button>
          <button onClick={confirmBorrow} className="confirm-button">Confirm Borrow</button>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetailsPage;
