import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';

/**
 * Synthesize a JWT token
 * 
 * @param {Object} user - User object containing id and role
 * @returns {string} The signed JWT token
 */
const issueToken = (user) => jwt.sign(
    { id: user.id, role: user.role }, 
    ENV.JWT_SECRET, 
    { expiresIn: ENV.JWT_EXPIRES_IN }
);

/**
 * Verify a JWT token
 * 
 * @param {string} token - The JWT token to verify
 * @returns {Object} The decoded payload from the token
 */
const verifyToken = (token) => jwt.verify(token, ENV.JWT_SECRET);

/**
 * Pulls the auth token from the header
 * 
 * @param {string} authorizationHeader - The authorization header containing the Bearer token
 * @returns {string|null} The extracted token, or null if the header is invalid
 */
const extractToken = (authorizationHeader) => (
    authorizationHeader?.startsWith('Bearer ') 
        ? authorizationHeader.split(' ')[1] 
        : null
);


export { issueToken, verifyToken, extractToken };
