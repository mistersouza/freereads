import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id
 * @returns {String} - JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {id: user.id, role: user.role }, 
        ENV.JWT_SECRET, 
        { expiresIn: ENV.JWT_EXPIRES_IN }
    );
}

/**
 * Verify a JWT token
 * @param {String} token - JWT token
 * @returns {Object} - Decoded token payload
 * @throws {ApiError} - If token is invalid or expired
 */
const verifyToken = (token) => {
    return jwt.verify(token, ENV.JWT_SECRET);
}

export { generateToken, verifyToken };
