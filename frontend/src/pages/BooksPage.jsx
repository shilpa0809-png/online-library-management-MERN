import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './BooksPage.css';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: Search input state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/books');
        setBooks(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // New: Filter books based on search term
  const filteredBooks = books.filter((book) => {
    const lowerTerm = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(lowerTerm) ||
      book.author.toLowerCase().includes(lowerTerm) ||
      book.genre.toLowerCase().includes(lowerTerm)
    );
  });

  if (loading) {
    return (
      <div className="books-loading">
        <LoadingSpinner />
        <p>Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="books-page">
      <h2 className="books-title">Our Book Collection</h2>

      {/* ✅ Search bar */}
      <input
        type="text"
        placeholder="Search by title, author, or genre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="books-search-bar"
      />

      {filteredBooks.length === 0 ? (
        <p className="books-empty">No books match your search.</p>
      ) : (
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BooksPage;
