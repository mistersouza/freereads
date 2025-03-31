import crypto from 'crypto'
import { redisClient } from '../../infrastructure/redis/index.js';
import { log } from '../../services/error/index.js';
import { ENV } from '../../config/env.js';

/**
 * Scan for blacklist status
 * 
 * @param {string} ip - IP address to check
 * @returns {Promise<{isBlacklisted: boolean, remainingTime: number}>}
 */
const isIPBlacklisted = async (ip) => {
  if (!redisClient.isReady) return { isBlacklisted: false };
  
  try {
    const key = `${ENV.BLACKLIST_PREFIX}:${ip}`;
    const value = await redisClient.get(key);
    
    if (!value) return { isBlacklisted: false };
    
    const ttl = await redisClient.ttl(key);
    return { 
      isBlacklisted: true, 
      remainingTime: ttl 
    };
  } catch (error) {
    log.error(error);
    return { isBlacklisted: false };
  }
};

/**
 * Blacklist an IP address
 * 
 * @param {string} ip - IP address to blacklist
 * @param {string} reason - Reason for blacklisting
 * @returns {Promise<boolean>} - Success status
 */
const blacklistIP = async (ip, reason) => {
  if (!redisClient.isReady) return false;
  
  try {
    const key = `${ENV.BLACKLIST_PREFIX}:${ip}`;
    await redisClient.set(key, reason);
    await redisClient.expire(key, ENV.BLACKLIST_DURATION);
    
    log.warn(`IP blacklisted: ${ip}`, { reason });
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
};

/**
 * Revoke a user's access token
 * 
 * @param {string} token - The original authentication token
 * @param {Object} payload - The decoded JWT payload
 * @param {string} payload.id - User identifier
 * @param {number} payload.exp - Token expiration timestamp
 * @param {number} payload.iat - Token issued at timestamp
 * @returns {Promise<boolean>} - Indicates whether the token was successfully blacklisted
 */
const blacklistToken = async (token, payload) => {
  if (!redisClient.isReady) return false;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const key = `${ENV.BLACKLIST_PREFIX}:${hashedToken}`;

    await redisClient.set(key, payload.id);
    await redisClient.expire(key, payload.exp - payload.iat);

    log.info(`User ${payload.id}'s token blacklisted`);
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
};

/**
 * See if a token is blocked
 * 
 * @param {string} token - The authentication token to check
 * @returns {Promise<boolean>} - Indicates whether the token is blacklisted
 */
const isTokenBlacklisted = async (token) => {
  if (!redisClient.isReady) return false;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const key = `${ENV.BLACKLIST_PREFIX}:${hashedToken}`;
    return !!(await redisClient.get(key));
  } catch (error) {
    log.error(error);
    return false;
  }
};

const blacklistAllTokens = async (payload) => {
  if (!redisClient.isReady) return false;

  try {
    const key = `${ENV.BLACKLIST_PREFIX}:user:${payload.id}:blacklisted`;
    await redisClient.set(key, payload.id);
    await redisClient.expire(key, ENV.BLACKLIST_DURATION || 86400);
    
    log.info(`User ${payload.id}'s tokens blacklisted`);
    return true;
  } catch (error) {
    log.error(error);
    return false;
  }
};

/**
 * Internal method to record failed attempts
 * 
 * @param {string} ip - IP address
 * @param {string} type - Type of attempt (login, api)
 * @param {number} maxAttempts - Maximum allowed attempts
 * @returns {Promise<{blacklisted: boolean, attempts: number}>}
 */
const _recordAttempt = async (ip, type, maxAttempts) => {
  if (!redisClient.isReady) return { blacklisted: false };
  
  try {
    const attemptKey = `${ENV.BLACKLIST_PREFIX}:attempts:${type}:${ip}`;
    const blacklistKey = `${ENV.BLACKLIST_PREFIX}:${ip}`;
    
    if (await redisClient.get(blacklistKey)) {
      return { blacklisted: true };
    }
    
    const attempts = await redisClient.incr(attemptKey);
    
    if (attempts === 1) {
      await redisClient.expire(attemptKey, ENV.ATTEMPT_RESET_TIME);
    }
    
    if (attempts >= maxAttempts) {
      await blacklistIP(ip, `Too many ${type} attempts`);
      return { blacklisted: true, attempts };
    }
    
    return { blacklisted: false, attempts };
  } catch (error) {
    log.error(error);
    return { blacklisted: false };
  }
};

export {
  isIPBlacklisted,
  blacklistIP,
  blacklistToken,
  isTokenBlacklisted,
  blacklistAllTokens,
  _recordAttempt,
};