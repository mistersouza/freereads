import { Router } from 'express';
import { register, login, logout, refresh } from '../controllers/auth-controller.js';
import { validateMember, validateToken } from '../middlewares/validate-middleware.js';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication API (v1)
 */
const router = Router();

router.post('/register', validateMember, register);
router.post('/login', validateMember, login);
router.post('/logout', validateToken, logout);
router.post('/refresh', validateToken, refresh);

export default router;