import { authenticateUser } from "./authenticate-user.js";

/**
 * Initializes the user service.
 * @returns {Object} User service functions
 */
const initializeUserService = () => ({
    loadAuthenticatedUser: authenticateUser(true),
    loadAuthorizedUser: authenticateUser(false),
});

export { initializeUserService };
