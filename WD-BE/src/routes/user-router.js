import express from 'express';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
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

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

export default router;