import { log } from '../services/error/logger.js';

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
      isIPBlacklisted,
      remainingTime,
    } = await request.app.locals.services.blacklist.isIPBlacklisted(request.ip);

    if (isIPBlacklisted) {
      log.warn(`${request.ip} is on the blacklist.`);

      return response.status(429).json({
        message: `You're on timeout. Chill for ${remainingTime} seconds before trying again.`,
      });
    }
    return next();
  } catch (error) {
    log.error(error);
    return next(error);
  }
};

export { throttleBlacklist };
