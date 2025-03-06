import { verifyToken } from '../utils/jwt-handler.js';
import { ApiError, JwtError } from '../errors/index.js';
import { getResourceName } from '../errors/index.js';

/**
 * Creates middleware for authorizing access based on user roles or resource ownership.
 * 
 * This middleware performs the following authorization checks:
 * 1. Verifies that a valid JWT token is present in the request headers
 * 2. Validates the token signature and expiration
 * 3. Checks if the user has one of the authorized roles
 * 4. For resource-specific routes, checks if the user owns the resource
 * 
 * @param {Object} options - Authorization options
 * @param {Array<string>} [options.roles=['boss', 'overlord']] - Roles that have authorized access
 * @param {Object} [options.model=null] - Mongoose model for checking resource ownership
 * @returns {Function} Express middleware function that handles authorization
 * 
 * @throws {JwtError} When token is missing, invalid, or expired
 * @throws {ApiError} When user lacks permission or resource doesn't exist
 * 
 * @example
 * // Role access
 * router.get('/admin-data', authorizeAccess(), getData)
 * 
 * @example
 * // Owner-only resource access
 * router.put('/books/:id', authorizeAccess({ model: Book }), updateBook)
 */const authorizeAccess = ({ roles = ['boss', 'overlord'], model = null } = {}) => {
    return async (request, response, next) => {
        if (!request.headers.authorization?.startsWith('Bearer ')) {
            return next(JwtError.missing());
        }

        const token = request.headers.authorization.split(' ')[1];
        
        try {
            const decoded = verifyToken(token);
            if (roles.includes(decoded.role)) {
                return next();
            }

            const { id } = request.params
            if (!id || !model) {
                return next(new ApiError(403, getResourceName(request)));
            }

            const resource = await model.findById(id);
            if (!resource) {
                return next(new ApiError(404, getResourceName(request)));
            }

            const isSelf = decoded.id === id;
            const isOwner = decoded.id === resource.userId.toString();
            if (!isOwner && !isSelf) {
                return next(new ApiError(403, getResourceName(request)));
            }
        
            next();
        } catch (error) {
            error.expireAt
                ? next(JwtError.expiredAt())
                : next(JwtError.invalid());
        }
    };
};

export { authorizeAccess};
