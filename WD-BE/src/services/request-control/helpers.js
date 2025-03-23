import { isIP } from 'net';
import { ENV } from '../../config/env.js';
import { log } from '../../errors/index.js';

const isAuthRoute = (path) => /^\/api\/v1\/auth\/?.*$/i.test(path);

/**
 * Determines if rate limiting should be skipped for a given request based on its IP address
 * @param {Object} request - The request object to check
 * @returns {boolean} Whether rate limiting should be skipped for the request
 */
const shouldSkipRateLimit = (request) => {
    try {
        if (!request.ip) {
            log.warn('IP address is MIA');
            return false;
        }

        if (!isIP(request.ip)) {
            log.warn(`IP address: ${request.ip} seems off :/`);
            return false;
        }

        const localIps = new Set(
            ENV.TRUSTED_IPS
                .split(',')
                .map(ip => ip.trim())
                .filter(ip => Boolean(ip.length))
        );

        return localIps.has(request.ip);
    } catch (error) {
        log.error(error);
        return false;
    }
};

export { isAuthRoute, shouldSkipRateLimit};