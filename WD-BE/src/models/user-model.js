import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
 *           description: User's email address (automatically trimmed and converted to lowercase)
 *           unique: true
 *         hashedPassword:
 *           type: string
 *           description: Hashed user password (never returned in responses due to select:false)
 *         role:
 *           type: string
 *           enum: [member, boss, overlord]
 *           default: member
 *           description: User's role in the system
 *         books:
 *           type: array
 *           items:
 *             type: string
 *             description: Book IDs associated with this user (MongoDB ObjectIds)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created (automatically generated)
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated (automatically generated)
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         email: "user@example.com"
 *         role: "member"
 *         books: ["60d21b4667d0d8992e610c86"]
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 *       description: |
 *         User model with automatic password hashing on save.
 *         The model includes a comparePassword method that securely compares an unhashed password
 *         with the stored hashed password using bcrypt.
 *
 *         Notes:
 *         - Password hashing uses bcrypt with 12 salt rounds
 *         - hashedPassword is never returned in query results (select:false)
 *         - Email is automatically normalized (trimmed and lowercased)
 *         - Timestamps (createdAt, updatedAt) are automatically managed
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already exists'],
    trim: true,
    lowercase: true,
  },
  hashedPassword: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: {
      values: ['member', 'boss', 'overlord'],
      message: '{VALUE} is not supported',
    },
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
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.hashedPassword);
};

export default mongoose.model('User', userSchema);
