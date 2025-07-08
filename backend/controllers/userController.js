// controllers/userController.js
const asyncHandler = require('express-async-handler'); // For simplified error handling in async routes
const User = require('../models/User'); // Import the User model

// @desc    Get the profile of the currently logged-in user
// @route   GET /api/users/profile
// @access  Private (requires user authentication)
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware (from authMiddleware.js)
    // .select('-password') ensures the password hash is not returned in the response
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        // If user is found, send their details
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            borrowedBooks: user.borrowedBooks, // Include IDs of borrowed books
        });
    } else {
        res.status(404); // Not Found
        throw new Error('User not found');
    }
});

// @desc    Get all users in the system
// @route   GET /api/users
// @access  Private/Admin (only administrators can view all users)
const getUsers = asyncHandler(async (req, res) => {
    // Find all users, excluding their passwords from the response
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get a single user by their ID
// @route   GET /api/users/:id
// @access  Private/Admin (only administrators can view specific user details)
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password'); // Get user ID from URL parameter

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update a user's details (e.g., name, email, role, password)
// @route   PUT /api/users/:id
// @access  Private/Admin (only administrators can update other users)
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id); // Find the user to update

    if (user) {
        // Update fields if provided in the request body, otherwise keep existing value
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role; // Allows admin to change user roles

        // If a new password is provided, update it (hashing handled by User model's pre-save hook)
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save(); // Save the updated user document

        // Send back the updated user details (excluding password)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin (only administrators can delete users)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id); // Find the user to delete

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.deleteOne(); // Delete the user document from the database
    res.status(200).json({ message: 'User removed' }); // Success message
});

// Export the controller functions
module.exports = {
    getUserProfile,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};