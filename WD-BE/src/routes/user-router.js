import express from 'express';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import { normalizeError, USER_ERROR_MESSAGES } from '../errors/index.js';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/user-controller.js';

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