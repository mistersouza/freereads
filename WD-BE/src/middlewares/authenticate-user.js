import { JwtError } from '../errors/index.js';

/**
 * JWT-powered authentication
 * 
 * @param {boolean} authenticate - Whether authentication is required
 */
const authenticateUser = (authenticate) => (request, response, next) => {
    const token = request.app.locals.services.jwt
        .extractToken(request.headers.authorization);

    if (!token) {
        return authenticate 
            ? next(JwtError.missing()) 
            : next();
    }

    try {
        request.user = request.app.locals.services.jwt.verifyToken(token);
        next();
    } catch (error) {
        return authenticate 
            ? next(error.expireAt ? JwtError.expiredAt() : JwtError.invalid())
            : next();
    }
};

const loadAuthenticatedUser = authenticateUser(true);
const loadAuthorizedUser = authenticateUser(false);

export { loadAuthenticatedUser, loadAuthorizedUser };
