// server.js
const express = require('express');
const dotenv = require('dotenv'); // To load environment variables from .env file
const cors = require('cors'); // To enable Cross-Origin Resource Sharing
const connectDB = require('./config/db'); // Function to connect to MongoDB
const { errorHandler } = require('./middleware/errorMiddleware'); // Custom error handling middleware

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const borrowingRoutes = require('./routes/borrowings');
const digitalResourceRoutes = require('./routes/digitalResources'); // Placeholder for future digital resource specific routes

// Load environment variables from .env file (must be called early)
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize Express application
const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing) for all origins.
// This is essential for your frontend (running on a different port/origin) to communicate with your backend.
app.use(cors());

// Define API Routes
// Each 'app.use' line maps a base URL path to a specific router file.
// For example, requests to '/api/auth/register' will be handled by authRoutes.
app.use('/api/auth', authRoutes); // Routes for user authentication (register, login)
app.use('/api/users', userRoutes); // Routes for user profiles and admin user management
app.use('/api/books', bookRoutes); // Routes for book management (get, add, update, delete)
app.use('/api/borrowings', borrowingRoutes); // Routes for borrowing and returning books
app.use('/api/digital-resources', digitalResourceRoutes); // Placeholder route for digital resources

// Custom error handling middleware.
// This should be placed after all other routes and middleware so it can catch any errors that occur.
app.use(errorHandler);

// Define the port the server will listen on.
// It tries to use the PORT environment variable from .env, or defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the Express server and make it listen for incoming requests on the specified port.
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});