// controllers/authController.js
const User = require('../models/user'); // Import the User model
const asyncHandler = require('express-async-handler'); // A utility to simplify error handling in async Express routes

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can register)
const registerUser = asyncHandler(async (req, res) => {
    // Extract user data from the request body
    const { name, email, password, role } = req.body;

    // 1. Check if a user with the provided email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Set HTTP status to 400 (Bad Request)
        throw new Error('User already exists'); // Throw an error that will be caught by asyncHandler and errorMiddleware
    }

    // 2. Create a new user in the database
    // The password hashing is handled by the pre-save hook in the User model
    const user = await User.create({
        name,
        email,
        password,
        role, // The role can be specified during registration (e.g., 'student', 'librarian', 'admin')
    });

    // 3. If user creation is successful, send a token response
    if (user) {
        sendTokenResponse(user, 201, res); // 201 status for successful creation
    } else {
        res.status(400); // If user data was invalid for some reason
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user and log them in
// @route   POST /api/auth/login
// @access  Public (anyone can log in)
const loginUser = asyncHandler(async (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // 1. Validate if email and password are provided
    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter an email and password');
    }

    // 2. Check for user in the database
    // .select('+password') is used because 'password' field is set to select: false in the model,
    // meaning it's excluded by default. We need it for comparison here.
    const user = await User.findOne({ email }).select('+password');

    // If user not found
    if (!user) {
        res.status(401); // 401 status for Unauthorized
        throw new Error('Invalid credentials'); // Generic message for security
    }

    // 3. Check if the provided password matches the hashed password in the database
    const isMatch = await user.matchPassword(password); // Uses the custom method defined in User model

    if (!isMatch) {
        res.status(401);
        // THIS WAS THE LIKELY PROBLEM LINE: It should be 'throw new Error(...)' not 'throw new new Error(...)'
        throw new Error('Invalid credentials'); // Generic message for security
    }

    // 4. If credentials match, send a token response
    sendTokenResponse(user, 200, res); // 200 status for successful login
});

// Helper function to send JWT token and user data in the response
const sendTokenResponse = (user, statusCode, res) => {
    // Generate a JWT token for the user
    const token = user.getSignedJwtToken(); // Uses the custom method defined in User model

    // Remove the password from the user object before sending it in the response (security)
    user.password = undefined;

    // Send the response with success status, token, and user details
    res.status(statusCode).json({
        success: true,
        token, // The authentication token
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        borrowedBooks: user.borrowedBooks, // Include borrowed books IDs for frontend context
    });
};

// Export the controller functions to be used by routes
module.exports = {
    registerUser,
    loginUser,
};