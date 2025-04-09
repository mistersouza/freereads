import {
  issueTokenPair, verifyToken, extractToken, refreshAccessToken,
} from './utils.js';

/**
 * Boot up JWT service
 *
 * @returns {Object} - JWT service functions
 */
const initializeJwtService = () => ({
  issueTokenPair,
  verifyToken,
  extractToken,
  refreshAccessToken,
});

export { initializeJwtService };
