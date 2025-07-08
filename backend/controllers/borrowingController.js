// controllers/borrowingController.js
const asyncHandler = require('express-async-handler');
const Borrowing = require('../models/Borrowing'); // Import Borrowing model
const Book = require('../models/book');         // Import Book model
const User = require('../models/user');         // Import User model

// @desc    Borrow a book
// @route   POST /api/borrowings
// @access  Private (requires user authentication)
const borrowBook = asyncHandler(async (req, res) => {
    const { bookId, returnDate } = req.body; // Get book ID and expected return date from request body
    const userId = req.user._id; // Get user ID from the authenticated request (set by protect middleware)

    // 1. Find the book and user in the database
    const book = await Book.findById(bookId);
    const user = await User.findById(userId);

    if (!book) {
        res.status(404); // Not Found
        throw new Error('Book not found');
    }

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // 2. Check if the book is available for borrowing
    if (book.availableCopies <= 0) {
        res.status(400); // Bad Request
        throw new Error('No copies of this book are currently available.');
    }

    // 3. Check if the user has already borrowed this specific book and not returned it yet
    const existingBorrowing = await Borrowing.findOne({
        user: userId,
        book: bookId,
        status: { $in: ['borrowed', 'overdue', 'requested'] } // Check for active (non-returned) borrowings
    });

    if (existingBorrowing) {
        res.status(400);
        throw new Error('You have already borrowed this book.');
    }

    // 4. Create a new borrowing record
    const borrowing = new Borrowing({
        user: userId,
        book: bookId,
        borrowDate: new Date(), // Set borrow date to now
        returnDate: new Date(returnDate), // Use the provided return date
        status: 'borrowed' // Set initial status
    });

    const createdBorrowing = await borrowing.save(); // Save the new borrowing record

    // 5. Update book's available copies and user's borrowedBooks list
    book.availableCopies -= 1; // Decrement available copies
    await book.save();

    user.borrowedBooks.push(book._id); // Add book ID to user's borrowed list
    await user.save();

    res.status(201).json(createdBorrowing); // 201 Created status
});

// @desc    Return a book
// @route   PUT /api/borrowings/return/:id
// @access  Private (requires user authentication)
const returnBook = asyncHandler(async (req, res) => {
    const borrowingId = req.params.id; // Get borrowing record ID from URL parameter
    const userId = req.user._id; // Get user ID from authenticated request

    // 1. Find the borrowing record and populate book details
    const borrowing = await Borrowing.findById(borrowingId).populate('book');
    const user = await User.findById(userId);

    if (!borrowing) {
        res.status(404);
        throw new Error('Borrowing record not found');
    }

    // 2. Authorization Check: Ensure only the borrower or an admin/librarian can return the book
    if (borrowing.user.toString() !== userId.toString() && !(req.user.role === 'admin' || req.user.role === 'librarian')) {
        res.status(403); // Forbidden
        throw new Error('Not authorized to return this book');
    }

    // 3. Check if the book has already been returned
    if (borrowing.status === 'returned') {
        res.status(400);
        throw new Error('Book has already been returned');
    }

    // 4. Update borrowing record status and actual return date
    borrowing.actualReturnDate = new Date(); // Set actual return date to now
    borrowing.status = 'returned'; // Change status to 'returned'

    // 5. Calculate fine if the book is overdue
    const expectedReturn = new Date(borrowing.returnDate);
    const actualReturn = new Date();
    if (actualReturn > expectedReturn) {
        const diffTime = Math.abs(actualReturn.getTime() - expectedReturn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds difference to days
        borrowing.fineAmount = diffDays * 1; // Example: $1 fine per day overdue
    }

    const updatedBorrowing = await borrowing.save(); // Save the updated borrowing record

    // 6. Update book's available copies and user's borrowedBooks list
    const book = await Book.findById(borrowing.book._id);
    if (book) {
        book.availableCopies += 1; // Increment available copies
        await book.save();
    }

    if (user) {
        // Remove the book from the user's borrowedBooks list
        user.borrowedBooks = user.borrowedBooks.filter(
            (bookId) => bookId.toString() !== borrowing.book._id.toString()
        );
        await user.save();
    }

    res.json(updatedBorrowing); // Send the updated borrowing record in response
});

// @desc    Get all borrowing records
// @route   GET /api/borrowings
// @access  Private/Admin/Librarian (only authorized roles can view all borrowings)
const getAllBorrowings = asyncHandler(async (req, res) => {
    const borrowings = await Borrowing.find({})
        .populate('user', 'name email') // Populate user details (name and email) from the 'User' model
        .populate('book', 'title author isbn'); // Populate book details (title, author, isbn) from the 'Book' model
    res.json(borrowings);
});

// @desc    Get a specific user's borrowed books
// @route   GET /api/borrowings/my-borrowings
// @access  Private (requires user authentication)
const getUserBorrowings = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get user ID from authenticated request
    // Find borrowing records for the current user that are still active (borrowed, overdue, requested)
    const borrowings = await Borrowing.find({ user: userId, status: { $in: ['borrowed', 'overdue', 'requested'] } })
        .populate('book', 'title author isbn coverImage'); // Populate relevant book details for display
    res.json(borrowings);
});

// Export the controller functions
module.exports = {
    borrowBook,
    returnBook,
    getAllBorrowings,
    getUserBorrowings
};