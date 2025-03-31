import mongoose from 'mongoose';
import User from '../models/user-model.js';
import { ApiError, getResourceName } from '../services/error/index.js';
import { BusinessValidationError } from '../services/error/classes/index.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         name:
 *           type: string
 *           description: Error class name (ApiError, BusinessValidationError, InputValidationError, JwtError)
 *         message:
 *           type: string
 *           description: User-friendly error message
 *         errorType:
 *           type: string
 *           enum: [unknown, api, business, validation, missing, expired, invalid]
 *           description: Category of error
 *         context:
 *           type: object
 *           properties:
 *             domain:
 *               type: string
 *               description: Resource area where error occurred (auth, books, etc.)
 *             issue:
 *               type: string
 *               enum: [permission, conflict, not_found, authentication, unprocessable_entity]
 *               description: Specific issue type for business errors
 *         fields:
 *           type: object
 *           description: Field-specific validation errors (for InputValidationError)
 *         summary:
 *           type: object
 *           properties:
 *             fields:
 *               type: array
 *               items:
 *                 type: string
 *             count:
 *               type: integer
 *           description: Summary of validation errors
 *         validation:
 *           type: object
 *           description: Validation errors from Mongoose
 *         method:
 *           type: string
 *           description: HTTP method of the request
 *         path:
 *           type: string
 *           description: URL path of the request
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the error occurred
 *   
 *     ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             name:
 *               example: "InputValidationError"
 *             errorType:
 *               example: "validation"
 *             fields:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *               example:
 *                 email: "Email format is invalid"
 *                 password: "Password must be at least 6 characters"
 *   
 *     BusinessError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             name:
 *               example: "BusinessValidationError"
 *             errorType:
 *               example: "business"
 *             context:
 *               type: object
 *               properties:
 *                 domain:
 *                   example: "auth"
 *                 issue:
 *                   example: "not_found"
 *   
 *     JwtError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             name:
 *               example: "JwtError"
 *             errorType:
 *               enum: [missing, expired, invalid]
 *               example: "expired"
 *             statusCode:
 *               example: 401
 *   
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
 *     description: Register a new user with an email, password, and an optional role
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
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationError'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   statusCode: 400
 *                   name: "InputValidationError"
 *                   message: "Input validation failed."
 *                   errorType: "validation"
 *                   context:
 *                     domain: "auth"
 *                   fields:
 *                     email: "Email format is invalid"
 *                   summary:
 *                     fields: ["email"]
 *                     count: 1
 *                   method: "POST"
 *                   path: "/api/v1/auth/register"
 *                   timestamp: "2023-05-01T12:34:56.789Z"
 *               castError:
 *                 value:
 *                   statusCode: 400
 *                   name: "CastError"
 *                   message: "Hmm… this ID seems off. It doesn't match any records"
 *                   errorType: "unknown"
 *                   method: "POST"
 *                   path: "/api/v1/auth/register"
 *                   timestamp: "2023-05-01T12:34:56.789Z"
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               statusCode: 409
 *               name: "BusinessValidationError"
 *               message: "We've seen you before! Try logging in instead."
 *               errorType: "business"
 *               context:
 *                 domain: "auth"
 *                 issue: "conflict"
 *               method: "POST"
 *               path: "/api/v1/auth/register"
 *               timestamp: "2023-05-01T12:34:56.789Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 500
 *               name: "Error"
 *               message: "Bookkeeper's out! Please knock again later."
 *               errorType: "unknown"
 *               method: "POST"
 *               path: "/api/v1/auth/register"
 *               timestamp: "2023-05-01T12:34:56.789Z"
 */

/**
 * Sign up a new user with email, password, and role.
 * 
 * @param {Object} request - Express request object containing user registration details
 * @param {Object} response - Express response object for sending registration result
 * @param {Function} next - Express next middleware function for error handling
 * @throws {BusinessValidationError} Throws an error if the email already exists
 * @returns {Object} User registration response with JWT token and user details
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
 *     description: Authenticate a user with their email and password, then issue a JWT token
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
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/BusinessError'
 *                 - $ref: '#/components/schemas/JwtError'
 *             examples:
 *               invalidCredentials:
 *                 value:
 *                   statusCode: 401
 *                   name: "BusinessValidationError"
 *                   message: "Something's off with that email or password. Give it another go!"
 *                   errorType: "business"
 *                   context:
 *                     domain: "auth"
 *                     issue: "authentication"
 *                   method: "POST"
 *                   path: "/api/v1/auth/login"
 *                   timestamp: "2023-05-01T12:34:56.789Z"
 *               expiredToken:
 *                 value:
 *                   statusCode: 401
 *                   name: "JwtError"
 *                   message: "Token's expired. Time for a fresh one!"
 *                   errorType: "expired"
 *                   method: "POST"
 *                   path: "/api/v1/auth/login"
 *                   timestamp: "2023-05-01T12:34:56.789Z"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               statusCode: 404
 *               name: "BusinessValidationError"
 *               message: "No luck! That username's off the grid. Try registering instead."
 *               errorType: "business"
 *               context:
 *                 domain: "auth"
 *                 issue: "not_found"
 *               method: "POST"
 *               path: "/api/v1/auth/login"
 *               timestamp: "2023-05-01T12:34:56.789Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 500
 *               name: "Error"
 *               message: "Bookkeeper's out! Please knock again later."
 *               errorType: "unknown"
 *               method: "POST"
 *               path: "/api/v1/auth/login"
 *               timestamp: "2023-05-01T12:34:56.789Z"
 */
/**
 * Log in a user with their email and password.
 * 
 * @param {Object} request - Express request object containing user credentials
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON response with user token and details or passes error to next middleware
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

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout a user
 *     description: Invalidates the user's JWT token, effectively logging them out
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out"
 *       401:
 *         description: Unauthorized, missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JwtError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/*
 * Log out user by blacklisting the JWT token
 * 
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON response or passes control to next middleware
 */
const logout = async (request, response, next) => {
    try {
        const token = request.app.locals.services.jwt
            .extractToken(request.headers.authorization);
        
        if (!token) {
            return response.status(200).json({
                message: 'Sign in when you’re ready.'
            });
        }; 

        try {
            const payload = request.app.locals.services.jwt
                .verifyToken(token);
            await request.app.locals.services.blacklist
                .blacklistToken(token, payload);

            return response.status(200).json({
                message: 'You’re out! See you again soon.'
            });
        } catch (jwtError) {
            return response.status(200).json({
                message: 'Session over. Please log back in.'
            });
        }
    } catch (error) {
        next(error);
    }
};

export { register, login, logout };