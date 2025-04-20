import { redisClient } from '../../infrastructure/redis/index.js';
import { log } from '../error/index.js';
import { ENV } from '../../config/env.js';

/**
 * Scan for blacklist status
 *
 * @param {string} ip - IP address to check
 * @returns {Promise<{isBlacklisted: boolean, remainingTime: number}>}
 */
const isIPBlacklisted = async (ip) => {
  log.info(`Checking if IP is blacklisted: ${ip}`);

  if (!redisClient.isReady) {
    log.warn('Redis is not ready. Skipping blacklist check.');
    return { isIPBlacklisted: false, remainingTime: 0 };
  }

  try {
    const key = `${ENV.BLACKLIST_PREFIX}:${ip}`;
    log.info(`Checking Redis key: ${key}`);
    const value = await redisClient.get(key);

    if (!value) {
      log.info(`IP ${ip} is not blacklisted.`);
      return { isIPBlacklisted: false, remainingTime: 0 };
    }

    const ttl = await redisClient.ttl(key);
    log.info(`IP ${ip} is blacklisted. Remaining TTL: ${ttl}`);
    return {
      isIPBlacklisted: true,
      remainingTime: ttl > 0 ? ttl : 0,
    };
  } catch (error) {
    log.error(`Error checking blacklist status for IP ${ip}:`, error);
    return { isIPBlacklisted: false, remainingTime: 0 };
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
  log.info(`Attempting to blacklist IP: ${ip} with reason: ${reason}`);
  log.info(`Blacklist prefix: ${ENV.BLACKLIST_PREFIX}`);

  if (!redisClient.isReady) {
    log.warn('Redis is not ready. Cannot blacklist IP.');
    return { status: 'failed', message: 'Memory is on a break.' };
  }

  try {
    const key = `${ENV.BLACKLIST_PREFIX}:${ip}`;
    log.info(`Setting Redis key: ${key}`);
    await redisClient.set(key, reason);
    log.info(`Key set successfully: ${key}`);
    await redisClient.expire(key, ENV.BLACKLIST_DURATION);
    log.info(`TTL set for key: ${key}, duration: ${ENV.BLACKLIST_DURATION}`);

    log.warn(`IP blacklisted successfully: ${ip}`, { reason });
    return { status: 'done', message: `IP ${ip} blacklisted.` };
  } catch (error) {
    log.error(`Failed to blacklist IP ${ip}:`, error);
    return { status: 'failed', message: `IP ${ip} dodged blacklisting.` };
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
      message: 'Oops! Redis is on a break.',
    };
  }

  try {
    const ttl = payload.exp - Math.floor(Date.now() / 1000);

    await redisClient.set(
      `${ENV.BLACKLIST_PREFIX}:${payload.jti}`,
      reason,
      { EX: ttl },
    );

    return { status: 'done' };
  } catch (error) {
    log.error(error);
    return {
      status: 'failed',
      message: 'Blacklisting the token failed.',
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

/**
 * Internal method to record failed attempts
 *
 * @param {string} ip - IP address
 * @param {string} type - Type of attempt (login, api)
 * @param {number} maxAttempts - Maximum allowed attempts
 * @returns {Promise<{blacklisted: boolean, attempts: number}>}
 */
const recordAttempt = async (ip, type, maxAttempts, attempt = 1) => {
  if (!redisClient.isReady) {
    log.info(`Recording attempt for IP: ${ip}, type: ${type}`);
    return {
      attempts: 0,
      attemptsLeft: maxAttempts,
    };
  }
  try {
    const attemptKey = `${ENV.BLACKLIST_PREFIX}:attempts:${type}:${ip}`;
    const attemptCount = await redisClient.get(attemptKey) || attempt;

    if (parseInt(attemptCount, 10) >= maxAttempts) {
      return {
        attempts: parseInt(attemptCount, 10),
        attemptsLeft: 0,
      };
    }

    const attempts = await redisClient.incr(attemptKey);

    if (attempts === 1) {
      await redisClient.expire(attemptKey, ENV.ATTEMPT_RESET_TIME);
      log.info(`Set expiration for ${attemptKey} to ${ENV.ATTEMPT_RESET_TIME}`);
    }

    const attemptsLeft = Math.max(0, maxAttempts - attempts);
    if (attemptsLeft > 0) await recordAttempt(ip, type, maxAttempts);

    return { attempts, attemptsLeft };
  } catch (error) {
    log.error(error);
    return {
      attempts: 0,
      attemptsLeft: maxAttempts,
    };
  }
};

export {
  isIPBlacklisted,
  blacklistIP,
  blacklistToken,
  isTokenBlacklisted,
  recordAttempt,
};
