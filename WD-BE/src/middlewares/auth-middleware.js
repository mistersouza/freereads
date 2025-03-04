import { verifyToken } from '../utils/jwt-handler.js';
import User from '../models/User.js';
import ApiError from '../errors/api-error.js';
import { AUTH_ERRORS } from '../constants/error-messages.js';

const authorize = (roles = ['boss', 'overlord']) => async (request, response, next) => {
    if (!request.headers.authorization?.startsWith('Bearer ')) {
        return next(new ApiError(AUTH_ERRORS.TOKEN_MISSING, 401))
    }

    const token = request.headers.authorization.split(' ')[1];

    try {
        const decoded = verifyToken(token);

        const { id } = request.params;

        if (id) {
            const requestedUser = await User.findById(id);

            if (!requestedUser) {
                return next(new ApiError(AUTH_ERRORS.NOT_FOUND, 404));
            }

            if (!roles.includes(decoded.role) && decoded.id !== id) {
                return next(new ApiError(AUTH_ERRORS.ACCESS_DENIED, 403));
            }
        }

        if (!id) {
            if (!roles.includes(decoded.role)) {
                return next(new ApiError(AUTH_ERRORS.ACCESS_DENIED, 403));
            }
        }
        next();
    } catch (jwtError) {
        next(jwtError);
    }
};

export default authorize;

