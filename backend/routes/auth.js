// routes/auth.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Import controller functions

const router = express.Router(); // Create a new Express router instance

// Define the route for user registration
// When a POST request comes to /api/auth/register, it will be handled by registerUser
router.post('/register', registerUser);

// Define the route for user login
// When a POST request comes to /api/auth/login, it will be handled by loginUser
router.post('/login', loginUser);

// Export the router so it can be used in server.js
module.exports = router;