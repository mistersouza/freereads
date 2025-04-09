import express from 'express';
import User from '../models/user-model.js';
import { authorizeAccess } from '../middlewares/auth-middleware.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user-controller.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API (v1)
 */

const router = express.Router();

router.route('/')
  .get(authorizeAccess(), getUsers)
  .post(authorizeAccess(), createUser);

router.route('/:id')
  .get(authorizeAccess({ model: User }), getUser)
  .put(authorizeAccess({ model: User }), updateUser)
  .delete(authorizeAccess({ model: User }), deleteUser);

export default router;
