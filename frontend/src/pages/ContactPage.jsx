import React, { useState } from 'react';
 import './ContactPage.css'; // ✅ Import your CSS

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: You can integrate this with your backend/email service later!
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p>If you have any questions, suggestions, or feedback, we’d love to hear from you!</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="contact-form">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />

          <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <label htmlFor="message">Message</label>
            <textarea
               name="message"
               rows="5"
               required
              value={formData.message}
              onChange={handleChange}
             ></textarea>

            <button type="submit">Send Message</button>
          </form>
       ) : (
           <div className="success-message">
             <h3>Thank you!</h3>
             <p>Your message has been sent. We’ll get back to you soon.</p>
           </div>
         )}
       </div>
     </div>
  );
 };

 export default ContactPage;

