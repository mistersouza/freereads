import { JwtError } from '../services/error/classes/index.js';

/**
 * JWT-powered authentication
 * 
 * @param {boolean} authenticate - Whether authentication is required
 */
const authenticateUser = (authenticate) => async (request, response, next) => {
    const token = request.app.locals.services.jwt
        .extractToken(request.headers.authorization);

    if (!token) {
        return authenticate 
            ? next(JwtError.missing()) 
            : next();
    }

    const isTokenBlacklisted = await request.app.locals.services.blacklist
        .isTokenBlacklisted(token);
    
    if (isTokenBlacklisted) {
        return next(JwtError.blacklisted());
    }

    try {
        request.user = request.app.locals.services.jwt
            .verifyToken(token, 'access');
            
        next();
    } catch (error) {
        return authenticate 
            ? next(error.expiredAt ? JwtError.expired() : JwtError.invalid())
            : next();
    }
};

const loadAuthenticatedUser = authenticateUser(true);
const loadAuthorizedUser = authenticateUser(false);

export { loadAuthenticatedUser, loadAuthorizedUser };
