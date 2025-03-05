import express from 'express';
import { normalizeError } from '../middlewares/error-handler-middleware.js';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/user-controller.js';

const router = express.Router();

// Handle routes access
router.use(authorizeAccess());

// Routes
router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

// Handle errors
router.use(normalizeError());

export default router;