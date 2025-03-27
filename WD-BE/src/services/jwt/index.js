import { issueToken, verifyToken, extractToken } from "./utils.js";

/**
 * Boot up JWT service
 * 
 * @returns {Object} - JWT service functions
 */
const initializeJwtService = () => ({
    issueToken,
    verifyToken,
    extractToken,
});

export { initializeJwtService };
