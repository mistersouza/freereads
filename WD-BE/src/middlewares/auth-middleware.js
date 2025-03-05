import { verifyToken } from '../utils/jwt-handler.js';
import User from '../models/user-model.js';
import ApiError from '../errors/api-error.js';
import {
    AUTH_ERROR_MESSAGES,
    USER_ERROR_MESSAGES,
    JWT_ERROR_MESSAGES
} from '../constants/error-messages.js';

/**
 * Creates middleware for authorizing access based on user roles or self-identification.
 * 
 * @param {Array} roles - Array of roles that have authorized access (defaults to admin roles)
 * @returns {Function} Express middleware function that handles authorization
 */
const authorizeAccess = (roles = ['boss', 'overlord']) => async (request, response, next) => {
    if (!request.headers.authorization?.startsWith('Bearer ')) {
        return next(new ApiError(JWT_ERROR_MESSAGES.TOKEN_MISSING, 401))
    }

    const token = request.headers.authorization.split(' ')[1];

    try {
        const { id } = request.params;
        const decoded = verifyToken(token);
        const isAuthorized = roles.includes(decoded.role);
        const isSelf = decoded.id === id;

        if (!id) {
            if (!isAuthorized) {
                return next(new ApiError(AUTH_ERROR_MESSAGES.ACCESS_DENIED, 403));
            }
            return next();
        }

        const requestedUser = await User.findById(id);
        if (!requestedUser) {
            return next(new ApiError(USER_ERROR_MESSAGES.USER_NOT_FOUND, 404));
        }
 
        if (!isAuthorized && !isSelf) {
            return next(new ApiError(AUTH_ERROR_MESSAGES.ACCESS_DENIED, 403));
        }

        next();
    } catch (jwtError) {
        next(jwtError);
    }
};

export { authorizeAccess };
