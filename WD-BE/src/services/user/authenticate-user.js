import { verifyToken } from '../../utils/jwt-handler.js';
import { JwtError } from '../../errors/index.js';

/**
 * Middleware to authenticate a user based on JWT.
 * @param {boolean} authenticate - Whether authentication is required
 */
const authenticateUser = (authenticate) => (request, response, next) => {
    if (!request.headers.authorization?.startsWith('Bearer ')) {
        return authenticate 
            ? next(JwtError.missing()) 
            : next();
    }

    try {
        request.user = verifyToken(request.headers.authorization.split(' ')[1]);
        next();
    } catch (error) {
        return authenticate 
            ? next(error.expireAt ? JwtError.expiredAt() : JwtError.invalid())
            : next();
    }
};

export { authenticateUser };
