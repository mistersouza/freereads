import { isBlacklisted, blacklistIP, _recordAttempt } from "./helpers.js";
import { log } from "../../errors/index.js";
import { ENV } from "../../config/env.js";

/**
 * Sets up the blacklist service with advanced IP management and tracking
 * 
 * @returns {Object} An object containing blacklist-related methods:
 * - blacklistIP: Function to add an IP to the blacklist
 * - isBlacklisted: Function to check if an IP is blacklisted
 * - recordFailedApi: Method to record and track API abuse attempts
 * - recordFailedLogin: Method to record and track failed login attempts
 */
const initializeBlacklist = async () => {
  return {
    blacklistIP,
    isBlacklisted,
    recordFailedApi: async (ip) => _recordAttempt(ip, "api", ENV.MAX_API_ABUSE)
        .catch((error) => log.error(error)),
    recordFailedLogin: async (ip) => _recordAttempt(ip, "login", ENV.MAX_LOGIN_ATTEMPTS)
        .catch((error) => log.error(error)),
  };
};

export { initializeBlacklist };