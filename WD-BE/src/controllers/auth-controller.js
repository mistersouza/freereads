import mongoose from 'mongoose';
import User from '../models/user-model.js';
import { ApiError, getResourceName } from '../errors/index.js';
import { generateToken } from '../utils/jwt-handler.js';

/**
 * @swagger
 * components:
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
const register = async (request, response, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, role } = request.body;

        const activeAccount = await User.findOne({ email });
        if (activeAccount) {
            throw new ApiError(
                409,
                getResourceName(request)
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
const login = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            throw new ApiError(
                404,
                getResourceName(request)
            );
        }

        if (!await user.comparePassword(password)) {
            throw new ApiError(
                401,
                getResourceName(request)
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