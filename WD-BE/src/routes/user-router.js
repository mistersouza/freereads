import express from 'express';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import { USER_ERROR_MESSAGES } from '../constants/error-messages.js';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser 
} from '../controllers/user-controller.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API (v1)
 */

const router = express.Router();

router.use(authorizeAccess());

// Routes
router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

// Error handling middleware
router.use(normalizeError(USER_ERROR_MESSAGES));

export default router;