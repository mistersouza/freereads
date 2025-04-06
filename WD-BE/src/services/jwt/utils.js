import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redisClient } from '../../infrastructure/redis/index.js';
import { ENV } from '../../config/env.js';
import { ApiError, JwtError } from '../error/classes/index.js';
import { log } from '../error/index.js';

/**
 * Secure and stashes a JWT token in db.
 *Generates a unique JWT ID (jti) and sets an expiration time based on refresh token settings.
 * 
 * @param {string} id - The user ID to associate with the token
 * @returns {Promise<Object>} Object containing the token storage status and JWT ID
 * @returns {boolean} Object.isTokenSet - Whether the token was successfully stored
 * @returns {string} Object.jti - The generated JWT ID
 */
const storeToken = async (id) => {
    if (!redisClient.isReady) return { isTokenSet: false };
    
    const jti = crypto.randomUUID();
    const ttl = ENV.JWT_REFRESH_EXPIRES_IN;

    const response = await redisClient.set(
        `${ENV.JWT_PREFIX}:${jti}`,
        JSON.stringify({
            jti,
            user: id,
            lastUsed: Date.now(),
        }),
        { 'EX': ttl },
    );

    return { isTokenSet: response === 'OK', jti };
};

/**
 * Synthesize a JWT tokens.
 * 
 * @param {Object} user - User object containing id and role
 * @returns {string} The signed JWT tokens
 */
const issueTokenPair = async (user) => {
    const { isTokenSet, jti } = await storeToken(user.id);

    if (!isTokenSet) {
        throw new ApiError({
            status: 500,
            message: 'Failed to cache authentication token',
            errorType: 'TokenStorage',
        })
    }

    const payload = {
        jti,
        id: user.id,
        role: user.role,
    };
    const accessToken = jwt.sign(
        { ...payload, type: 'access' }, ENV.JWT_ACCESS_SECRET,
        { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN },
    );
    const refreshToken = jwt.sign(
        { ...payload, type: 'refresh' }, ENV.JWT_REFRESH_SECRET,
        { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN },
    );

    log.info(`${user.id} issued access and refresh tokens`);
    
    return { accessToken, refreshToken };
}

/**
 * Verify a JWT token
 * 
 * @param {string} token - The JWT token to verify
 * @param {string} type - The expected token type ('access' or 'refresh')
 * @returns {Object} The decoded and verified token payload
 * @throws {JwtError} If the token is invalid, expired, or of the wrong type
 */
const verifyToken = (token, type) => {    
    try {
        const payload = jwt.verify(token, ENV[`JWT_${type.toUpperCase()}_SECRET`]);
        
        if (payload.type !== type) throw JwtError.invalid();
        
        return payload;    
    } catch (error) {
        throw error.expiredAt 
            ? JwtError.expired() 
            : JwtError.invalid();
    }
}

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

/**
 * Refreshes an access token using a valid refresh token.
 * Implements token rotation for security by invalidating the used refresh token
 * and issuing a new token pair.
 * 
 * TOKEN ROTATION FLOW:
 * 1. Verify refresh token signature and type
 * 2. Delete the used refresh token from Redis (single-use pattern)
 * 3. Generate a new token pair with a new JWT ID
 * 4. Store the new refresh token information in Redis
 * 5. Return both tokens to the client
 * 
 * SECURITY BENEFITS:
 * - Refresh tokens are single-use, limiting attack window if token is stolen
 * - Creates a chain of token provenance that can be audited
 * - Prevents replay attacks using previously-used refresh tokens
 * 
 * @param {string} token - The refresh token used to generate a new access token
 * @returns {Promise<Object>} Object containing the new access and refresh tokens
 * @returns {string} Object.accessToken - New short-lived token for API access
 * @returns {string} Object.refreshToken - New longer-lived token for obtaining future access tokens
 * @throws {JwtError} If the refresh token is invalid or of the wrong type
 * @throws {ApiError} If storing the new token in Redis fails
 */
const refreshAccessToken = async (token) => {
    const decoded = verifyToken(token, 'refresh');
    
    await redisClient.del(`${ENV.JWT_PREFIX}:${decoded.jti}`);
    
    const { isTokenSet, jti } = await storeToken(decoded.id);
    
    if (!isTokenSet) {
        throw new ApiError({
            status: 500,
            message: 'Failed to cache authentication token',
            errorType: 'TokenStorage',
        })
    }
    
    const payload = {
        jti,
        id: decoded.id,
        role: decoded.role,
    };
    
    const accessToken = jwt.sign(
        { ...payload, type: 'access' }, 
        ENV.JWT_ACCESS_SECRET,
        { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
        { ...payload, type: 'refresh' }, 
        ENV.JWT_REFRESH_SECRET,
        { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN }
    );

    log.info(`User ${payload.id} tokens refreshed.`);

    return { accessToken, refreshToken };
}

export { issueTokenPair, verifyToken, extractToken, refreshAccessToken };
