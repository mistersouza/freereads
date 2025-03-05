import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/user-controller.js';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { authorizeAccess } from '../middlewares/auth-middleware.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API (v1)
 */

const router = express.Router();

// Apply authorization middleware to all routes in this router
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
router.use(normalizeError());

export default router;