import { ApiError } from '../errors/index.js';
import { getResourceName } from '../errors/index.js';

/**
 * Generates middleware to control access based on roles or ownership
 * 
 * @param {Object} [options={}] - Configuration options for access authorization
 * @param {Array<string>} [options.roles=['boss', 'overlord']] - Allowed user roles
 * @param {Object} [options.model=null] - Mongoose model for resource ownership verification
 * @returns {Function[]} Middleware functions for handling access authorization
 * @throws {ApiError} When authorization fails due to insufficient permissions
 */
const authorizeAccess = ({ roles = ['boss', 'overlord'], model = null } = {}) => [
    (request, response, next) => (
        request.app.locals.services.user
            .loadAuthenticatedUser(request, response, next)
    ),
    async (request, response, next) => {
        const { user } = request;
        if (roles.includes(user.role)) return next();

        const { id } = request.params;
        if (!id || !model) {
            return next(new ApiError(403, getResourceName(request)));
        }

        try {
            const resource = await model.findById(id);
            if (!resource) {
                return next(new ApiError(404, getResourceName(request)));
            }

            const isOwner = user.id === resource.userId.toString();
            const isSelf = user.id === id;
            if (!isOwner && !isSelf) {
                return next(new ApiError(403, getResourceName(request)));
            }

            next();
        } catch (error) {
            next(error);
        }
    }
];

export { authorizeAccess };
