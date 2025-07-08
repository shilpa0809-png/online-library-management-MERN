// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating authentication tokens

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // Ensures email addresses are unique
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6, // Minimum password length
        select: false, // Don't return password in queries by default (for security)
    },
    role: {
        type: String,
        enum: ['student', 'librarian', 'admin'], // Allowed roles for users
        default: 'student', // Default role for new users if not specified
    },
    borrowedBooks: [ // Array to store IDs of books currently borrowed by this user
        {
            type: mongoose.Schema.ObjectId, // This means it will store MongoDB Object IDs
            ref: 'Book', // This tells Mongoose that these IDs refer to documents in the 'Book' collection
        },
    ],
    createdAt: { // Timestamp for when the user account was created
        type: Date,
        default: Date.now,
    },
});

// Mongoose Middleware: This function runs *before* a user document is saved to the database.
// Its purpose is to hash the password for security.
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (e.g., on creation or password change)
    if (!this.isModified('password')) {
        next(); // If password hasn't changed, skip hashing and move to the next middleware
    }

    const salt = await bcrypt.genSalt(10); // Generate a salt (random string) to add complexity to the hash
    this.password = await bcrypt.hash(this.password, salt); // Hash the password using the generated salt
    next(); // Move to the next middleware or save operation
});

// Mongoose Method: This adds a custom method to the User model.
// It allows you to compare an entered password (e.g., during login) with the hashed password in the database.
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // bcrypt.compare compares a plain text password with a hashed password
    return await bcrypt.compare(enteredPassword, this.password);
};

// Mongoose Method: This adds another custom method to the User model.
// It generates a JSON Web Token (JWT) for authentication.
UserSchema.methods.getSignedJwtToken = function () {
    // jwt.sign() creates the token
    return jwt.sign(
        { id: this._id, role: this.role }, // Payload: Data to store in the token (user ID and role)
        process.env.JWT_SECRET,          // Secret key from your .env file (used to sign/verify the token)
        {
            expiresIn: process.env.JWT_EXPIRE, // Token expiration time (e.g., '1h', '30d')
        }
    );
};

// Export the User model so it can be used in other files (like controllers)
module.exports = mongoose.model('User', UserSchema);
