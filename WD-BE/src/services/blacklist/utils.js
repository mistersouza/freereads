import crypto from 'crypto'
import { redisClient } from '../../infrastructure/redis/index.js';
import { log } from '../../services/error/index.js';
import { ENV } from '../../config/env.js';
import User from '../../models/user-model.js';

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
    
    if (!value) return { isIPBlacklisted: false };
    
    const ttl = await redisClient.ttl(key);
    return { 
      isIPBlacklisted: true, 
      remainingTime: ttl 
    };
  } catch (error) {
    log.error(error);
    return { isIPBlacklisted: false };
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
const blacklistToken = async (payload, reason = 'Refresh rotation') => {
  if (!redisClient.isReady) {
    return {
      status: 'failed',
      message: 'Oops! Redis is on a break.' 
    };
  }

  try {
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    
    await redisClient.set(
      `${ENV.BLACKLIST_PREFIX}:${payload.jti}`,
      reason,
      { EX: ttl }
    );

    return { status: 'done' };
  } catch (error) {
    log.error(error);
    return { 
      status: 'failed', 
      message: 'Blacklisting the token failed.' 
    };
  }
};

/**
 * See if a token is blocked
 * 
 * @param {string} token - The authentication token to check
 * @returns {Promise<boolean>} - Indicates whether the token is blacklisted
 */
const isTokenBlacklisted = async (payload) => {
  if (!redisClient.isReady) return false;

  try {
    return !!(await redisClient.get(`${ENV.BLACKLIST_PREFIX}:${payload.jti}`));
  } catch (error) {
    log.error(error);
    return false;
  }
};

const blacklistAllTokens = async (payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Jwt.deleteMany({ user: payload.id }, { session });
    await session.commitTransaction();
    session.endSession();

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