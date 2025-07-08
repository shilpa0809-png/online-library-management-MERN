// routes/users.js
const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController'); // Import user controller functions
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import authentication and authorization middleware

// GET /api/users/profile: Route for getting the currently logged-in user's profile
// 'protect' middleware ensures the user is authenticated
router.get('/profile', protect, getUserProfile);

// Routes for managing all users (Admin only)
router.route('/')
    // GET /api/users: Only admin can get all users
    .get(protect, authorizeRoles('admin'), getUsers);

// Routes for managing a specific user by ID
router.route('/:id')
    // GET /api/users/:id: Only admin can get a user by ID
    .get(protect, authorizeRoles('admin'), getUserById)
    // PUT /api/users/:id: Only admin can update a user
    .put(protect, authorizeRoles('admin'), updateUser)
    // DELETE /api/users/:id: Only admin can delete a user
    .delete(protect, authorizeRoles('admin'), deleteUser);

// Export the router
module.exports = router;