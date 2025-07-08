
// routes/books.js
const express = require('express');
const {
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController'); // Import book controller functions
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import authentication and authorization middleware

const router = express.Router(); // Create a new Express router instance

// Define routes for the base /api/books path
router.route('/')
    .get(getBooks) // GET /api/books: Public access to view all books
    // POST /api/books: Only admin or librarian can add books
    // 'protect' middleware ensures user is authenticated
    // 'authorizeRoles' middleware ensures user has 'admin' or 'librarian' role
    .post(protect, authorizeRoles('admin', 'librarian'), addBook);

// Define routes for /api/books/:id (for a specific book by its ID)
router.route('/:id')
    .get(getBookById) // GET /api/books/:id: Public access to view single book details
    // PUT /api/books/:id: Only admin or librarian can update a book
    .put(protect, authorizeRoles('admin', 'librarian'), updateBook)
    // DELETE /api/books/:id: Only admin or librarian can delete a book
    .delete(protect, authorizeRoles('admin', 'librarian'), deleteBook);

// Export the router
module.exports = router;