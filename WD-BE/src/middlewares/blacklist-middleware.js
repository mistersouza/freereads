import { BusinessValidationError, getResourceName, log } from '../services/error/index.js';

/**
 * Block blacklisted IPs & throttling abusers.
 * 
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @param {Function} next - Express next middleware function
 */
const throttleBlacklist = async (request, response, next) => {
    try {
        const { 
            isBlacklisted, 
            remainingTime,
        } = await request.app.locals.services.blacklist.isBlacklisted(request.ip);
        
        if (isBlacklisted) {
            log.warn(`${request.ip} is on the blacklist.`);
            
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