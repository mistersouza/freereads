import mongoose from 'mongoose';
import User from '../models/user-model.js';
import { ApiError, getResourceName } from '../errors/index.js';
import { BusinessValidationError } from '../services/error/classes/index.js';

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 409
 *                 name:
 *                   type: string
 *                   example: BusinessValidationError
 *                 message:
 *                   type: string
 *                   example: We've seen you before! Try logging in instead.
 *                 errorType:
 *                   type: string
 *                   example: business
 *                 context:
 *                   type: object
 *                   properties:
 *                     domain:
 *                       type: string
 *                       example: auth
 *                     issue:
 *                       type: string
 *                       example: conflict
 *                 method:
 *                   type: string
 *                   example: POST
 *                 path:
 *                   type: string
 *                   example: /api/v1/auth/register
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 name:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 errorType:
 *                   type: string
 *                   example: unknown
 *                 method:
 *                   type: string
 *                   example: POST
 *                 path:
 *                   type: string
 *                   example: /api/v1/auth/register
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

const register = async (request, response, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, role } = request.body;

        const activeAccount = await User.findOne({ email });
        if (activeAccount) {
            throw BusinessValidationError.conflict(getResourceName(request));
        }

        const [ user ] = await User.create(
            [{ email, hashedPassword: password, role }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        response.status(201).json({
            token: request.app.locals.services.jwt.issueToken(user),
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 401
 *                 name:
 *                   type: string
 *                   example: ApiError
 *                 message:
 *                   type: string
 *                   example: Something's off with that email or password. Give it another go!
 *                 errorType:
 *                   type: string
 *                   example: unknown
 *                 method:
 *                   type: string
 *                   example: POST
 *                 path:
 *                   type: string
 *                   example: /api/v1/auth/login
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 name:
 *                   type: string
 *                   example: ApiError
 *                 message:
 *                   type: string
 *                   example: No luck! That username's off the grid. Try registering instead.
 *                 errorType:
 *                   type: string
 *                   example: unknown
 *                 method:
 *                   type: string
 *                   example: POST
 *                 path:
 *                   type: string
 *                   example: /api/v1/auth/login
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 name:
 *                   type: string
 *                   example: Error
 *                 message:
 *                   type: string
 *                   example: Bookkeeper's out! Please knock again later.
 *                 errorType:
 *                   type: string
 *                   example: unknown
 *                 method:
 *                   type: string
 *                   example: POST
 *                 path:
 *                   type: string
 *                   example: /api/v1/auth/login
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
const login = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const user = await User.findOne({ email }).select('+hashedPassword');
        if (!user) {
            throw BusinessValidationError.notFound(getResourceName(request));
        }

        if (!await user.comparePassword(password)) {
            await request.app.locals.services.blacklist.recordFailedLogin(request.ip);
            throw BusinessValidationError.unauthorized(getResourceName(request));
        }

        response.json({
            token: request.app.locals.services.jwt.issueToken(user),
            user: { email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

export { register, login };