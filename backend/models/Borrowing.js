
// models/Borrowing.js
const mongoose = require('mongoose');

const BorrowingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId, // Stores the ID of the user
        ref: 'User', // References the 'User' model
        required: true,
    },
    book: {
        type: mongoose.Schema.ObjectId, // Stores the ID of the book
        ref: 'Book', // References the 'Book' model
        required: true,
    },
    borrowDate: {
        type: Date,
        default: Date.now, // Defaults to the current date/time when borrowed
    },
    returnDate: { // The expected date by which the book should be returned
        type: Date,
        required: true,
    },
    actualReturnDate: { // The actual date when the book was returned (null if not yet returned)
        type: Date,
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue', 'requested'], // Possible statuses for a borrowing record
        default: 'borrowed', // Default status when a book is first borrowed
    },
    fineAmount: {
        type: Number,
        default: 0, // Default fine amount is 0
    },
    createdAt: { // Timestamp for when the borrowing record was created
        type: Date,
        default: Date.now,
    },
});

// Export the Borrowing model
module.exports = mongoose.model('Borrowing', BorrowingSchema);