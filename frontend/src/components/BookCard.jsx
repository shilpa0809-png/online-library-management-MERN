import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import './BookCard.css'; // Import your CSS module

const BookCard = ({ book }) => {
  const statusText = book.isDigital
    ? 'Digital Resource'
    : book.availableCopies > 0
    ? 'AVAILABLE'
    : 'NOT AVAILABLE';

  const statusClass = book.isDigital
    ? 'status-digital'
    : book.availableCopies > 0
    ? 'status-available'
    : 'status-unavailable';

  return (
    <div className="book-card">
      <div className="book-card-content">
        <Link to={`/books/${book._id}`} className="book-title">
          {book.title}
        </Link>
        <p className="book-author">
          <User className="author-icon" /> {book.author}
        </p>
      </div>
      <div className="book-card-status">
        <span className={`book-status ${statusClass}`}>
          Status: {statusText}
        </span>
        {!book.isDigital && book.availableCopies > 0 && (
          <p className="book-copies">
            ({book.availableCopies} avail)
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
