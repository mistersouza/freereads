import mongoose from 'mongoose';

import ApiError from '../errors/api-error.js';
import User from '../models/User.js';
import { ENV } from '../config/env.js';
import { AUTH_ERROR_MESSAGES } from '../constants/error-messages.js';
import { generateToken } from '../utils/jwt-handler.js';

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
 *           description: Book IDs associated with this user
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email, password, and optional role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be unique)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [member, boss, overlord]
 *                 default: member
 *                 description: User's role in the system
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */

/**
 * Registers a new user in the system with email, password, and optional role
 * Uses MongoDB transactions to ensure data integrity during the registration process
 * 
 * @async
 * @function register
 * @param {Object} request - Express request object
 * @param {Object} request.body - Request body containing user information
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's plain text password (will be hashed)
 * @param {string} [request.body.role='member'] - User's role in the system
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} - Resolves when registration is complete
 * @throws {ApiError} - Throws 409 error if email already exists
 */
const register = async (request, response, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, role } = request.body;

        const activeAccount = await User.findOne({ email });
        if (activeAccount) {
            throw new ApiError(
                AUTH_ERROR_MESSAGES.EMAIL_IN_USE,
                409
            );
        }

        const [ user ] = await User.create(
            [{ email, password, role }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        response.status(201).json({
            token: generateToken(user),
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user with email and password and returns a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                     role:
 *                       type: string
 *                       description: User's role in the system
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * Authenticates a user using email and password credentials
 * Returns a JWT token upon successful authentication
 * 
 * @async
 * @function login
 * @param {Object} request - Express request object
 * @param {Object} request.body - Request body containing login credentials
 * @param {string} request.body.email - User's email address
 * @param {string} request.body.password - User's password
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} - Resolves when authentication is complete
 * @throws {ApiError} - Throws 404 error if user not found or 401 if password incorrect
 */
const login = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            throw new ApiError(
                AUTH_ERROR_MESSAGES.UNKNOWN_USER,
                404
            );
        }

        if (!await user.comparePassword(password)) {
            throw new ApiError(
                AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
                401
            );
        }

        response.json({
            token: generateToken(user),
            user: { email, role: user.role }
        });
    } catch (error) {
        next(error);
        
    }
};

export { register, login };
