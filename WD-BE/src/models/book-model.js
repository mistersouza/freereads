import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - releaseYear
 *         - genre
 *         - isbn
 *         - copies
 *         - hubs
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Book title
 *         author:
 *           type: string
 *           description: Book author
 *         releaseYear:
 *           type: number
 *           description: Year the book was published
 *         genre:
 *           type: string
 *           description: Book genre
 *         isbn:
 *           type: string
 *           description: International Standard Book Number (unique)
 *         description:
 *           type: string
 *           description: Book description
 *         copies:
 *           type: number
 *           description: Number of copies available
 *         isAvailable:
 *           type: boolean
 *           description: Whether the book is available (auto-calculated from copies)
 *         thumbnail:
 *           type: string
 *           description: URL to book cover image
 *         hubs:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of hubs where the book is available
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the book was added to the system
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the book was last updated
 */

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "No title, no tale! Let's add one"],
        trim: true,
    },
    author: {
        type: String,
        required: [true, "No ghostwriters here! Drop the author's name."],
        trim: true,
    },
    releaseYear: {
        type: Number,
        required: true,
        min: 0,
    },
    genre: {
        type: String,
        required: true,
        trim: true,
    },
    isbn: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
    copies: {
        type: Number,
        required: true,
        min: 0,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    thumbnail: {
        type: String,
        trim: true,
    },
    hubs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Give this book a home!'],
            ref: 'Hub',
        }
    ]
}, {
    timestamps: true,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     BookAvailability:
 *       type: object
 *       properties:
 *         isAvailable:
 *           type: boolean
 *           description: Flag indicating if at least one copy of the book is available
 *         copies:
 *           type: number
 *           description: Number of copies currently available
 */

/**
 * Pre-save middleware to automatically set isAvailable based on copies count
 * Sets isAvailable to true if copies > 0, otherwise false
 */
bookSchema.pre('save', async function (next) {
    const book = this;
    if (!book.isModified('copies')) return next();
    book.isAvailable = this.copies > 0;
    next();
});

export default mongoose.model('Book', bookSchema);
