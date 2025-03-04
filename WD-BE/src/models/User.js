import mongoose from "mongoose";
import bcrypt from "bcryptjs";;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         email:
 *           type: string
 *           description: User's email address
 *           unique: true
 *         role:
 *           type: string
 *           enum: [member, boss, overlord]
 *           default: member
 *           description: User's role in the system
 *         books:
 *           type: array
 *           items:
 *             type: string
 *             description: Book IDs associated with this user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         email: "user@example.com"
 *         role: "member"
 *         books: ["60d21b4667d0d8992e610c86"]
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  hashedPassword: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ['member', 'boss', 'overlord'],
    default: 'member',
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
    },
  ],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('hashedPassword')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.hashedPassword);
}

export default mongoose.model('User', userSchema);
