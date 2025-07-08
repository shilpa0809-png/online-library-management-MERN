// middleware/authMiddleware.js
const jwt = require('jsonwebtoken'); // For working with JSON Web Tokens
const User = require('../models/User'); // Import the User model
const asyncHandler = require('express-async-handler'); // Utility to handle async errors in Express routes

// 'protect' middleware: Authenticates users by verifying their JWT token
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with 'Bearer'
    // Example: Authorization: Bearer <token_string>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extract the token string (remove 'Bearer ' prefix)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token using the secret key from environment variables
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Find the user in the database based on the ID from the decoded token payload
            // .select('-password') ensures the password hash is not included in req.user
            req.user = await User.findById(decoded.id).select('-password');

            // 5. If user is not found (e.g., user deleted after token was issued)
            if (!req.user) {
                res.status(401); // Unauthorized
                throw new Error('Not authorized, user not found');
            }

            next(); // If authentication is successful, proceed to the next middleware or route handler
        } catch (error) {
            console.error('Token verification failed:', error); // Log the specific error for debugging
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed'); // Generic message for client
        }
    }

    // 6. If no token was provided in the Authorization header
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// 'authorizeRoles' middleware: Authorizes users based on their roles
// Takes a variable number of arguments, which are the roles allowed to access the route
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if the authenticated user's role (from req.user, set by 'protect')
        // is included in the list of allowed roles for this route
        if (!roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }
        next(); // If authorized, proceed to the next middleware or route handler
    };
};

// Export the middleware functions
module.exports = { protect, authorizeRoles };