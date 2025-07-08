import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css'; // Import your custom CSS

const NotFoundPage = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-heading">404</h1>
      <h2 className="notfound-subheading">Page Not Found</h2>
      <p className="notfound-text">
        The page you are looking for does not exist or you don't have permission to view it.
      </p>
      <Link to="/" className="notfound-home-link">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
