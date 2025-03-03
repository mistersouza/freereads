import { verifyToken } from '../utils/jwt-handler.js';
import User from '../models/User.js';
import ApiError from '../errors/api-error.js';
import { ENV } from '../config/env.js';
import { AUTH_ERRORS } from '../constants/error-messages.js';

const authorize = (roles = ['boss', 'overlord']) => async (request, response, next) => {
    let error = null;
    const { id } = request.params;

    if (!request.headers.authorization?.startsWith('Bearer ')) {
        error = new ApiError(AUTH_ERRORS.TOKEN_MISSING, 401);
    }

    if (!error) {
        const token = request.headers.authorization.split(' ')[1];
        try {
            const decoded = verifyToken(token);

            if (id) {
                const requestedUser = await User.findById(id);

                if (!requestedUser) {
                    error = new ApiError(AUTH_ERRORS.USER_NOT_FOUND, 404);
                }

                if (!roles.includes(decoded.role) && decoded.id !== id) {
                    error = new ApiError(AUTH_ERRORS.ACCESS_DENIED, 403);
                }
            }

            if (!id) {
                if (!roles.includes(decoded.role)) {
                    error = new ApiError(AUTH_ERRORS.ACCESS_DENIED, 403);
                }
            }
        } catch (jwtError) {
            error = new ApiError(
                jwtError.expiredAt 
                    ? AUTH_ERRORS.EXPIRED_TOKEN 
                    : AUTH_ERRORS.INVALID_TOKEN, 
                401
            );
        }
    }
    next(error);
};

export default authorize;