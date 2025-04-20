import { log } from '../error/index.js';
import { ENV } from '../../config/env.js';
import {
  isIPBlacklisted,
  blacklistIP,
  blacklistToken,
  isTokenBlacklisted,
  recordAttempt,
} from './utils.js';

/**
 * Sets up a powerful blacklist service
 *
 * @returns {Object} An object containing blacklist-related methods:
 * - blacklistIP: Function to add an IP to the blacklist
 * - isBlacklisted: Function to check if an IP is blacklisted
 * - recordFailedApi: Method to record and track API abuse attempts
 * - recordFailedLogin: Method to record and track failed login attempts
 * - blacklistToken: Function to invalidate a specific JWT token
 * - isTokenBlacklisted: Function to check if a token is blacklisted
 * - blacklistAllTokens: Function to invalidate all tokens for a user
 */
const initializeBlacklist = async () => ({
  blacklistIP,
  isIPBlacklisted,
  blacklistToken,
  isTokenBlacklisted,
  recordFailedApi: async (ip) => {
    try {
      log.info(`Recording failed API attempt for IP: ${ip}`);
      return await recordAttempt(ip, 'api', ENV.MAX_API_ABUSE);
    } catch (error) {
      log.error(error);
      throw error; // Rethrow the error to propagate it
    }
  },
  recordFailedLogin: async (ip) => recordAttempt(ip, 'login', ENV.MAX_LOGIN_ATTEMPTS)
    .catch((error) => log.error(error)),
  recordFailedRefresh: async (ip) => recordAttempt(ip, 'refresh', ENV.MAX_REFRESH_ATTEMPTS)
    .catch((error) => log.error(error)),
});

export { initializeBlacklist };
