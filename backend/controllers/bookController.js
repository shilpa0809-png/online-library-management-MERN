// controllers/bookController.js

const asyncHandler = require('express-async-handler');
const Book = require('../models/book'); // Your Mongoose Book model

/**
 * @desc    Get all books with optional filtering, sorting, and pagination
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = asyncHandler(async (req, res) => {
  let query;

  const reqQuery = { ...req.query };
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  query = Book.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50; // ✅ updated default limit
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Book.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  const books = await query;

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: books.length,
    total,
    pagination,
    data: books
  });
});

/**
 * @desc    Get a single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.status(200).json({
    success: true,
    data: book
  });
});

/**
 * @desc    Add a new book
 * @route   POST /api/books
 * @access  Private (Admin/Librarian)
 */
const addBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    isbn,
    genre,
    publicationYear,
    description,
    quantity,
    isDigital,
    digitalLink,
    coverImage
  } = req.body;

  // Check for duplicate ISBN
  const existingBook = await Book.findOne({ isbn });
  if (existingBook) {
    res.status(400);
    throw new Error('Book with this ISBN already exists');
  }

  const book = await Book.create({
    title,
    author,
    isbn,
    genre,
    publicationYear,
    description,
    quantity,
    availableCopies: quantity,
    isDigital,
    digitalLink,
    coverImage,
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

/**
 * @desc    Update a book by ID
 * @route   PUT /api/books/:id
 * @access  Private (Admin/Librarian)
 */
const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Handle quantity changes and update available copies correctly
  if (req.body.quantity !== undefined && req.body.quantity !== book.quantity) {
    const oldQuantity = book.quantity;
    const newQuantity = req.body.quantity;
    const change = newQuantity - oldQuantity;

    book.quantity = newQuantity;
    book.availableCopies = Math.max(0, book.availableCopies + change);
  }

  // Apply other updates
  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: book
  });
});

/**
 * @desc    Delete a book by ID
 * @route   DELETE /api/books/:id
 * @access  Private (Admin/Librarian)
 */
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  await book.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
};
