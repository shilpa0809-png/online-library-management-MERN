import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import './AddBookPage.css';

const AddBookPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    publicationYear: '',
    description: '',
    quantity: 1,
    isDigital: false,
    digitalLink: '',
    coverImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user || (user.role !== 'librarian' && user.role !== 'admin')) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/books', {
        ...newBook,
        publicationYear: Number(newBook.publicationYear),
        quantity: Number(newBook.quantity),
      });
      setMessage(`Book "${res.data.data.title}" added successfully!`);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publicationYear: '',
        description: '',
        quantity: 1,
        isDigital: false,
        digitalLink: '',
        coverImage: '',
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Error adding book:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to add book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-container">
      <div className="add-book-form-wrapper">
        <h2 className="add-book-title">Add New Book</h2>

        {message && <p className="add-book-success">{message}</p>}
        {error && <p className="add-book-error">{error}</p>}

        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="add-book-grid">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input name="title" id="title" value={newBook.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="author">Author</label>
              <input name="author" id="author" value={newBook.author} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input name="isbn" id="isbn" value={newBook.isbn} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input name="genre" id="genre" value={newBook.genre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="publicationYear">Publication Year</label>
              <input type="number" name="publicationYear" id="publicationYear" value={newBook.publicationYear} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input type="number" name="quantity" id="quantity" value={newBook.quantity} onChange={handleChange} min="1" required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea name="description" id="description" value={newBook.description} onChange={handleChange} rows="4"></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Cover Image URL</label>
            <input name="coverImage" id="coverImage" value={newBook.coverImage} onChange={handleChange} />
          </div>

          <div className="form-group checkbox-group">
            <input type="checkbox" name="isDigital" id="isDigital" checked={newBook.isDigital} onChange={handleChange} />
            <label htmlFor="isDigital">Is Digital Resource?</label>
          </div>

          {newBook.isDigital && (
            <div className="form-group">
              <label htmlFor="digitalLink">Digital Link</label>
              <input name="digitalLink" id="digitalLink" value={newBook.digitalLink} onChange={handleChange} required />
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;
