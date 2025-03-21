import { setRateLimiter, setSpeedLimiter } from './limiters.js';

/**
 * Initializes request control mechanisms using the provided store.
 * 
 * @param {Object} store - The storage mechanism for tracking rate and speed limits
 * @returns {Object} An object containing rate and speed limiters
 */
const initializeRequestControl = (store) => ({
        rateLimiter: setRateLimiter(store),
        speedLimiter: setSpeedLimiter(store)
    });

export { initializeRequestControl };