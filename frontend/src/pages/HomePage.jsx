import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import your custom CSS for this page

const HomePage = () => {
  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to the Online Library!</h2>
      <p className="home-description">
        Explore our vast collection of books and digital resources. Borrow, read,
        and manage your literary journey with ease.
      </p>
      <div className="home-buttons">
        <Link to="/books" className="btn browse-btn">
          Browse Books
        </Link>
        <Link to="/register" className="btn join-btn">
          Join Us
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
