import React from 'react';
import './Footer.css'; // Import your CSS file for styling

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Online Library. All rights reserved.
        </p>
        <p className="footer-subtext">
          Built with MERN Stack 
        </p>
        <p className="footer-subtext">
          contact us 
          <br />
          <span>Email : mylibrary@gmail.com</span><br />
          <span>PhoneNo : +91 8889996660</span><br />
          <span>Address : Gandhi Road, Hyderabad</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
