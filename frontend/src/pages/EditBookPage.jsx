import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import './EditBookPage.css';

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [editBookData, setEditBookData] = useState({
    title: '', author: '', isbn: '', genre: '', publicationYear: '',
    description: '', quantity: 1, isDigital: false, digitalLink: '', coverImage: '',
  });

  const [loading, setLoading] = useState(true);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== 'librarian' && user.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchBook = async () => {
      if (!user || (user.role !== 'librarian' && user.role !== 'admin')) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/books/${id}`);
        const fetchedBook = response.data.data;
        setBook(fetchedBook);
        setEditBookData({
          title: fetchedBook.title,
          author: fetchedBook.author,
          isbn: fetchedBook.isbn,
          genre: fetchedBook.genre,
          publicationYear: fetchedBook.publicationYear,
          description: fetchedBook.description || '',
          quantity: fetchedBook.quantity,
          isDigital: fetchedBook.isDigital,
          digitalLink: fetchedBook.digitalLink || '',
          coverImage: fetchedBook.coverImage || '',
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching book for edit:', err.response?.data?.message || err.message);
        setError(err.response?.data?.message || 'Failed to load book for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditBookData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmissionLoading(true);

    try {
      const res = await api.put(`/books/${id}`, {
        ...editBookData,
        publicationYear: Number(editBookData.publicationYear),
        quantity: Number(editBookData.quantity),
      });
      setMessage(`Book "${res.data.data.title}" updated successfully!`);
      setTimeout(() => {
        navigate('/librarian');
      }, 2000);
    } catch (err) {
      console.error('Error updating book:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-book-loading">
        <LoadingSpinner />
        <p>Loading book details for editing...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="edit-book-error">
        <p>{error}</p>
        <button onClick={() => navigate('/librarian')}>Back to Librarian Panel</button>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="edit-book-container">
      <div className="edit-book-card">
        <h2>Edit Book: {book.title}</h2>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="edit-book-form">
          <div className="form-grid">
            {[
              { label: 'Title', name: 'title' },
              { label: 'Author', name: 'author' },
              { label: 'ISBN', name: 'isbn' },
              { label: 'Genre', name: 'genre' },
              { label: 'Publication Year', name: 'publicationYear', type: 'number' },
              { label: 'Quantity', name: 'quantity', type: 'number' },
            ].map(({ label, name, type }) => (
              <div className="form-group" key={name}>
                <label htmlFor={`edit-${name}`}>{label}</label>
                <input
                  type={type || 'text'}
                  name={name}
                  id={`edit-${name}`}
                  value={editBookData[name]}
                  onChange={handleChange}
                  required
                  min={type === 'number' ? '1' : undefined}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              name="description"
              id="edit-description"
              value={editBookData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-coverImage">Cover Image URL</label>
            <input
              type="text"
              name="coverImage"
              id="edit-coverImage"
              value={editBookData.coverImage}
              onChange={handleChange}
            />
            {editBookData.coverImage && (
              <div className="cover-preview">
                <img src={editBookData.coverImage} alt="Cover Preview" />
              </div>
            )}
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="isDigital"
              id="edit-isDigital"
              checked={editBookData.isDigital}
              onChange={handleChange}
            />
            <label htmlFor="edit-isDigital">Is Digital Resource?</label>
          </div>

          {editBookData.isDigital && (
            <div className="form-group">
              <label htmlFor="edit-digitalLink">Digital Link</label>
              <input
                type="text"
                name="digitalLink"
                id="edit-digitalLink"
                value={editBookData.digitalLink}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/librarian')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={submissionLoading} className="submit-btn">
              {submissionLoading ? 'Updating...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookPage;
