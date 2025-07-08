// routes/borrowings.js
const express = require('express');
const router = express.Router();
const {
    borrowBook,
    returnBook,
    getAllBorrowings,
    getUserBorrowings
} = require('../controllers/borrowingController'); // Import borrowing controller functions
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

// POST /api/borrowings: User can borrow a book (requires authentication)
router.post('/', protect, borrowBook);

// PUT /api/borrowings/return/:id: User can return a book (requires authentication)
router.put('/return/:id', protect, returnBook);

// GET /api/borrowings/my-borrowings: Get the currently authenticated user's borrowed books
router.get('/my-borrowings', protect, getUserBorrowings);

// GET /api/borrowings: Admin/Librarian can view all borrowing records
router.get('/', protect, authorizeRoles('admin', 'librarian'), getAllBorrowings);

// Export the router
module.exports = router;