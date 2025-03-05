import { verifyToken } from '../utils/jwt-handler.js';
import User from '../models/User.js';
import ApiError from '../errors/api-error.js';
import { AUTH_ERROR_MESSAGES } from '../constants/error-messages.js';

const authorizeAccess = (roles = ['boss', 'overlord']) => async (request, response, next) => {
    if (!request.headers.authorization?.startsWith('Bearer ')) {
        return next(new ApiError(AUTH_ERROR_MESSAGES.TOKEN_MISSING, 401))
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
            return next(new ApiError(AUTH_ERROR_MESSAGES.USER_NOT_FOUND, 404));
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
