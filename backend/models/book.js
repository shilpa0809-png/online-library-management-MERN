// models/Book.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true, // Removes leading/trailing whitespace
    },
    author: {
        type: String,
        required: [true, 'Please add an author'],
        trim: true,
    },
    isbn: {
        type: String,
        required: [true, 'Please add an ISBN'],
        unique: true, // Ensures each book has a unique ISBN
        trim: true,
    },
    genre: {
        type: String,
        required: [true, 'Please add a genre'],
        trim: true,
    },
    publicationYear: {
        type: Number,
        required: [true, 'Please add a publication year'],
    },
    description: {
        type: String,
        trim: true,
    },
    coverImage: {
        type: String, // Stores a URL to the book's cover image
        default: 'https://placehold.co/200x280/cccccc/333333?text=No+Cover', // Default placeholder image if none provided
    },
    quantity: {
        type: Number,
        required: [true, 'Please add the total quantity of books'],
        min: [1, 'Quantity must be at least 1'], // Ensures quantity is at least 1
    },
    availableCopies: {
        type: Number,
        // Default value is set to the 'quantity' when a new book is created
        default: function() { return this.quantity; },
        min: [0, 'Available copies cannot be negative'], // Ensures available copies don't go below zero
    },
    isDigital: {
        type: Boolean,
        default: false, // False by default, meaning it's a physical book
    },
    digitalLink: {
        type: String, // URL for accessing the digital resource (e.g., PDF link)
        required: function() { return this.isDigital; }, // This field is required ONLY if isDigital is true
    },
    createdAt: { // Timestamp for when the book record was created
        type: Date,
        default: Date.now,
    },
});

// Export the Book model
module.exports = mongoose.model('Book', BookSchema);
