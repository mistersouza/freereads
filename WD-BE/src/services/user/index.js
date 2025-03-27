import User from '../../models/user-model.js';
import { initializeModelOps } from "../model/index.js";

/**
 * Fires up the user service
 * 
 * @returns {Object} User service functions
 */
const initializeUserService = () => {
    const ops = initializeModelOps(User, 'users');
    return {
        ...ops,
    };
};

export { initializeUserService };
