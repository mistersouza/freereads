import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
