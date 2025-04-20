import { isIP } from 'net';
import { ENV } from '../../config/env.js';
import { log } from '../error/index.js';

/**
 * Cleans up IPv4-mapped IPv6 addresses
 * @param {string} ip - The IP address to parse
 * @returns {string} The IP address without the ::ffff: prefix
 */
const parseIP = (ip) => ip.replace(/^::ffff:/, '');

/**
 * Checks if the path targets an auth endpoint.
 *
 * @param {string} path - The request path to evaluate.
 * @returns {boolean} True if the path is an auth route, false otherwise.
 */
const isAuthRoute = (path) => /^\/api\/v1\/auth\/?.*$/i.test(path);

/**
 * Skips trusted IPs.
 *
 * @param {Object} request - The request object to check
 * @returns {boolean} Whether rate limiting should be skipped for the request
 */
const shouldSkipIP = (request) => {
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
        .map((ip) => parseIP(ip.trim()))
        .filter((ip) => Boolean(ip.length)),
    );

    return localIps.has(parseIP(request.ip));
  } catch (error) {
    log.error(error);
    return false;
  }
};

export { isAuthRoute, shouldSkipIP };
