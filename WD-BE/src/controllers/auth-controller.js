import mongoose from 'mongoose';
import User from '../models/user-model.js';
import { getResourceName, log } from '../services/error/index.js';
import { BusinessValidationError, JwtError } from '../services/error/classes/index.js';
import { ENV } from '../config/env.js';

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
 *           description: Error class name (BusinessValidationError, InputValidationError, JwtError)
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
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token for API requests
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token for obtaining new access tokens
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                     role:
 *                       type: string
 *                       description: User's role in the system
 *             example:
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 email: "user@example.com"
 *                 role: "member"
 *       400:
 *         description: Invalid input or validation error
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
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

    const [user] = await User.create(
      [{ email, hashedPassword: password, role }],
      { session },
    );

    const { accessToken, refreshToken } = await request.app.locals.services.jwt
      .issueTokenPair(user);

    await session.commitTransaction();
    session.endSession();

    response.status(201).json({
      tokens: { accessToken, refreshToken },
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    log.error(error);
    if (session.inTransaction()) session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticate a user with their email and password, then issue JWT tokens
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
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token for API requests
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token for obtaining new access tokens
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                     role:
 *                       type: string
 *                       description: User's role in the system
 *             example:
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 email: "user@example.com"
 *                 role: "member"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * Log in a user with their email and password.
 *
 * @param {Object} request - Express request object containing user credentials
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} User token/details JSON or error via next()
 */
const login = async (request, response, next) => {
  const { email, password } = request.body;

  try {
    const user = await User.findOne({ email }).select('+hashedPassword');
    if (!user) {
      return next(BusinessValidationError.notFound(getResourceName(request)));
    }

    if (!await user.comparePassword(password)) {
      await request.app.locals.services.blacklist.recordFailedLogin(request.ip);
      return next(BusinessValidationError.unauthorized(getResourceName(request)));
    }

    const { accessToken, refreshToken } = await request.app.locals.services.jwt
      .issueTokenPair(user);

    return response.status(200).json({
      tokens: { accessToken, refreshToken },
      user: { email, role: user.role },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout a user
 *     description: Invalidates the user's refresh token, effectively logging them out
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to invalidate
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
 *                   example: "You're out! See you again soon."
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Server error
 */

/**
 * Log out user by blacklisting the JWT token
 *
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object|void} JSON response or passes control to next middleware
 */
const logout = async (request, response) => {
  const { refreshToken } = request.body;
  if (!refreshToken) {
    return response.status(200).json({
      message: 'Sign in when you’re ready.',
    });
  }

  try {
    const payload = request.app.locals.services.jwt
      .verifyToken(refreshToken, 'refresh');

    const { status, message } = await request.app.locals.services.blacklist
      .blacklistToken(payload);
    if (status === 'failed') {
      log.warn(`${ENV.BLACKLIST_PREFIX}:${payload.jti} - ${message}`);
      // TODO: Make the call — fail loud or let it slide? Review expected behavior.
    }

    return response.status(200).json({
      message: 'You\'re out! See you again soon.',
    });
  } catch (error) {
    log.error(error);
    return response.status(200).json({
      message: 'Session over. Please log back in.',
    });
  }
};

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Use a valid refresh token to obtain a new access token and refresh token pair
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: New token pair issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: New JWT refresh token
 *             example:
 *               tokens:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Missing refresh token
 *       401:
 *         description: Invalid, expired, or blacklisted refresh token
 *       500:
 *         description: Server error
 */

/**
 * Revives an access token using the provided refresh token.
 *
 * @param {Object} request - Express request object containing refresh token in body
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function for error handling
 * @returns {Object} New access and refresh token pair
 * @throws {JwtError} If refresh token is missing or invalid
 */
const refresh = async (request, response, next) => {
  const { refreshToken: token } = request.body;

  try {
    if (!token) throw JwtError.missing();

    const payload = request.app.locals.services.jwt
      .verifyToken(token, 'refresh');

    const isTokenBlacklisted = await request.app.locals.services.blacklist
      .isTokenBlacklisted(payload);

    if (isTokenBlacklisted) throw JwtError.blacklisted();

    const { status, message } = await request.app.locals.services.blacklist
      .blacklistToken(payload);
    if (status === 'failed') {
      log.warn(`${ENV.BLACKLIST_PREFIX}:${payload.jti} - ${message}`);
      // TODO: Make the call — fail loud or let it slide? Review expected behavior.
    }

    const { accessToken, refreshToken } = await request.app.locals.services.jwt
      .refreshAccessToken(token);

    response.status(200).json({
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

export {
  register, login, logout, refresh,
};
