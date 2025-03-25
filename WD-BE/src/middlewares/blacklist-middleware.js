import { ApiError, getResourceName, log } from '../errors/index.js';

/**
 * Middleware to block blacklisted IPs and halt further requests if throttled
 * 
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 */
const throttleBlacklist = async (request, response, next) => {
    const { services } = request.app.locals;

    try {
        const { isBlacklisted, remainingTime } = await services.isBlacklisted(request.ip);

        if (!services.isBlacklisted) return next();

        if (isBlacklisted) {
            return next(
                new ApiError(
                    429,
                    getResourceName(request), 
                    { remainingTime }
                ));
        }

        next();
   } catch (error) {
        log.error(error);
        next();
   }
};

export { throttleBlacklist };