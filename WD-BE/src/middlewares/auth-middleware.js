import { BusinessValidationError } from '../services/error/classes/index.js';
import { getResourceName } from '../services/error/index.js';
import { loadAuthenticatedUser } from './authenticate-user.js';

/**
 * Grant access based on roles or ownership
 *
 * @param {Object} [options={}] - Configuration options for access authorization
 * @param {Array<string>} [options.roles=['boss', 'overlord']] - Allowed user roles
 * @param {Object} [options.model=null] - Mongoose model for resource ownership verification
 * @returns {Function[]} Middleware functions for handling access authorization
 * @throws {ApiError} When authorization fails due to insufficient permissions
 */
const authorizeAccess = ({ roles = ['boss', 'overlord'], model = null } = {}) => [
  loadAuthenticatedUser,
  async (request, response, next) => {
    const { user } = request;
    if (roles.includes(user.role)) {
      return next();
    }

    const { id } = request.params;
    if (!id || !model) {
      return next(
        BusinessValidationError.forbidden('auth'),
      );
    }

    try {
      const resource = await model.findById(id);
      if (!resource) {
        return next(
          BusinessValidationError.notFound(getResourceName(request)),
        );
      }

      const userId = resource.userId || resource.id;
      const isOwner = user.id === userId?.toString();

      if (!isOwner) {
        return next(
          BusinessValidationError.forbidden('auth'),
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  },
];

export { authorizeAccess };
