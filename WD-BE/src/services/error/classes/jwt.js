import { ApiError } from './api.js';
/**
 * Custom error class for JWT authentication errors.
 * Extends ApiError to maintain consistent error handling throughout the application.
 */
class JwtError extends ApiError {
  /**
     * Create a new JWT authentication error.
     *
     * @param {string} errorType - Specific type of JWT error ('missing', 'expired', 'invalid')
     * @param {string} message - Human-readable error message to display to the client
     */
  constructor(errorType) {
    super(401, 'token');
    this.errorType = errorType;
    this.name = 'JwtError';
    this.resource = 'jwt';
    Error.captureStackTrace(this, this.constructor);
  }

  /**
     * Kicks off an error if the JWT token is MIA
     * @returns {JwtError} Error with 'missing' type
     */
  static missing() {
    return new JwtError('missing');
  }

  /**
     * Rings the alarm for expired JWT tokens
     * @returns {JwtError} Error with 'expired' type
     */
  static expired() {
    return new JwtError('expired');
  }

  /**
     * Hits the brakes on invalid JWT tokens—whether tampered or broken
     * @returns {JwtError} Error with 'invalid' type
     */
  static invalid() {
    return new JwtError('invalid');
  }

  /**
     * Throws a fireball when a blacklisted JWT token is detected
     * @returns {JwtError} Error with 'blacklisted' type
     */
  static blacklisted() {
    return new JwtError('blacklisted');
  }
}

export { JwtError };
