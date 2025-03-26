import User from '../../models/user-model.js';
import { initializeModelOps } from "../model/index.js";
import { authenticateUser } from "./authenticate-user.js";

/**
 * Fires up the user service
 * 
 * @returns {Object} User service functions
 */
const initializeUserService = () => {
    const ops = initializeModelOps(User, 'users');
    return {
        ...ops,
        loadAuthenticatedUser: authenticateUser(true),
        loadAuthorizedUser: authenticateUser(false),
    };
};

export { initializeUserService };
