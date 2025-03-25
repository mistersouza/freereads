import { BusinessValidationError, getResourceName, log } from '../errors/index.js';

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
        
        if (isBlacklisted) {
            log.warn(`Blocked request from blacklisted IP: ${request.ip}`);
            
            return response.status(429).json({
                message: `You're on timeout. Chill for ${remainingTime} seconds before trying again.`
            });
        }
        next();
   } catch (error) {
        log.error(error);
        next(error);
   }
};

export { throttleBlacklist };